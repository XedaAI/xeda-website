import { useLayoutEffect, useRef } from "react";
import type { FxProps } from "./index";

// Construction: the hand-off's set piece, "built floor by floor" (see
// construction.css). Rendered in the effects slot over the desktop result
// (.ix-fx, variant "desk") and over the phone window (.ixw-fx, variant
// "phone"). Decorative: the slot is aria-hidden.
//
//   phone    a crane hook comes down on its cable; the inputs are pulled
//            together into one strapped bundle under it, hooked, and hoisted
//            out of the top of the window, swinging. A blueprint grid rolls
//            up behind; the result is built floor by floor from the bottom:
//            each row is lowered on its own cable and lands hard (squash,
//            dust at both sides, the window shakes), the header last, as the
//            roof. Then the progress bar fills and the plan turns solid.
//   desktop  a tower crane rises at the result's right edge and slews its
//            jib over the result; the trolley runs out to the middle and
//            lowers each row into place, bottom row first, onto the
//            blueprint of the report, with the same heavy landings (the
//            panel shakes). Then the crane folds away and the bar fills.
//
// Where things go depends on the laid-out scene (the language and the
// width), so it is measured here and handed to the CSS as --hx-construction-*
// custom properties: again whenever a run starts and whenever the layout
// changes.

const V = "--hx-construction-";
const px = (v: number) => `${Math.round(v * 10) / 10}px`;

/** An element's layout position inside `host` (an offset ancestor), ignoring
 *  transforms, so an element mid-animation still reports where it rests. */
const offsetIn = (el: HTMLElement, host: HTMLElement) => {
  let x = 0;
  let y = 0;
  let e: HTMLElement | null = el;
  while (e && e !== host) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return { x, y };
};

const set = (el: HTMLElement, vars: Record<string, string>) => {
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(V + k, v);
};
const clear = (el: HTMLElement | null | undefined, keys: string[]) => {
  keys.forEach((k) => el?.style.removeProperty(V + k));
};

/** Phone: where the hook's tip stops (from the window's top), and how far
 *  the slings reach down from it to the bundle. */
const HOOK_TIP = 57;
const SLING = 38;
/** Each input in the bundle sits this much lower than the one before. */
const STACK = 7;

const VIEW_VARS = ["hx", "hy", "lift"];
const LIST_VARS = ["ox", "oy", "bl", "bw", "bt", "bh"];
const DESK_VARS = ["top", "sh", "jr", "jl", "tx"];

/** Phone: the bundle the inputs are gathered into (each input's way there),
 *  the hook's place over it, how far it all is hoisted, and how far each
 *  floor of the result falls. Relative to the window (.ixw-view). */
const measurePhone = (root: HTMLElement) => {
  const view = root.closest<HTMLElement>(".ixw-view");
  const list = view?.querySelector<HTMLElement>(".ixw-inputs");
  const result = view?.querySelector<HTMLElement>(".ixw-result");
  if (!view || !list || !result) return;
  const cards = [...list.querySelectorAll<HTMLElement>(".ixm-in")];
  if (cards.length) {
    const top = HOOK_TIP + SLING;
    let bottom = top;
    cards.forEach((card, i) => {
      const y = offsetIn(card, view).y;
      const to = top + i * STACK;
      set(card, { gy: px(to - y) });
      bottom = Math.max(bottom, to + card.offsetHeight);
    });
    const first = cards[0];
    const at = offsetIn(first, view);
    const l = offsetIn(list, view);
    const cx = at.x + first.offsetWidth / 2;
    set(view, { hx: px(cx), hy: px(HOOK_TIP), lift: px(-(bottom + 24)) });
    set(list, {
      ox: px(cx - l.x),
      oy: px(HOOK_TIP - l.y),
      bl: px(at.x - l.x),
      bw: px(first.offsetWidth),
      bt: px(top - l.y),
      bh: px(bottom - top),
    });
  }
  // Each floor falls from just above the window's top edge.
  const floors = [...result.querySelectorAll<HTMLElement>(".ixm-panel-head, .ixm-row")];
  floors.forEach((el) => {
    const y = offsetIn(el, view).y - result.scrollTop;
    set(el, { fall: px(-(y + el.offsetHeight + 18)) });
  });
};

/** Desktop: the stage's top edge and height (the crane stands on the
 *  stage's floor and its jib runs along the top), the gutter right of the
 *  result the mast stands in, and how far above the stage each row starts.
 *  Relative to the result's frame (.ix-out-inner), which the slot fills. */
const measureDesk = (root: HTMLElement) => {
  const stage = root.closest<HTMLElement>(".ix-stage");
  const host = root.closest<HTMLElement>(".ix-out-inner");
  const panel = host?.querySelector<HTMLElement>(".ix-panel");
  if (!stage || !host || !panel) return;
  const h = offsetIn(host, stage);
  const w = host.offsetWidth;
  const jr = Math.max(8, stage.clientWidth - (h.x + w));
  // The jib runs along the top edge, level with the stage's title: its tip
  // stops short of the title's text (measured, it is longer in English),
  // but it always reaches well past the middle, where the trolley works.
  const title = stage.querySelector<HTMLElement>(".ix-out .ix-stagehead-title");
  let tip = w * 0.3;
  if (title) {
    const range = document.createRange();
    range.selectNodeContents(title);
    tip = range.getBoundingClientRect().right - host.getBoundingClientRect().left + 16;
  }
  set(host, {
    top: px(-h.y),
    sh: px(stage.clientHeight),
    jr: px(jr),
    jl: px(Math.min(Math.max(tip, w * 0.2), w / 2 - 45)),
    // From the middle of the result (where the trolley works) to the mast.
    tx: px(w / 2 + jr / 2),
  });
  panel.querySelectorAll<HTMLElement>(".ix-row").forEach((row) => {
    const y = offsetIn(row, stage).y;
    set(row, { lift: px(-(y + row.offsetHeight + 44)) });
  });
};

/** The crane hook (phone): its cable from far above, the block with its
 *  sheave and hazard stripes, and the hook itself. Drawn at 1.25x, so the
 *  bowl's bottom (46 in its own units) is HOOK_TIP below the top. */
const Hook = () => (
  <svg className="hx-construction-hook" viewBox="0 0 40 56" aria-hidden="true">
    <line className="hx-construction-cable" x1="20" y1="-900" x2="20" y2="4" />
    <rect className="hx-construction-block" x="7" y="1" width="26" height="21" rx="4" />
    <circle className="hx-construction-sheave" cx="20" cy="8.5" r="3.4" />
    {[9.5, 15, 20.5, 26].map((x) => (
      <line key={x} className="hx-construction-stripe" x1={x} y1="20.5" x2={x + 4.5} y2="14.5" />
    ))}
    <rect className="hx-construction-shank" x="18" y="22" width="4" height="6" />
    <path className="hx-construction-hook-j" d="M20 27 V30 C20 33.5 26 34.5 26 40 A6 6 0 1 1 14 40 V36.5" />
  </svg>
);

/** The tower crane (desktop): mast and cab, the jib, the trolley. */
const Crane = () => (
  <>
    <span className="hx-construction-tower">
      <span className="hx-construction-mast" />
      <span className="hx-construction-cab" />
    </span>
    <span className="hx-construction-jib" />
    <span className="hx-construction-trolley">
      <svg viewBox="0 0 30 44" aria-hidden="true">
        <rect className="hx-construction-trolley-body" x="2" y="0" width="26" height="36" rx="3" />
        <circle className="hx-construction-sheave" cx="9" cy="31" r="3" />
        <circle className="hx-construction-sheave" cx="21" cy="31" r="3" />
        <line className="hx-construction-trolley-rail" x1="5" y1="25" x2="25" y2="25" />
      </svg>
    </span>
  </>
);

const ConstructionFx = ({ variant, lang }: FxProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    const scene = root?.closest<HTMLElement>(".ix-scene");
    if (!root || !scene) return;
    const measure = () => (variant === "phone" ? measurePhone(root) : measureDesk(root));
    measure();
    // Again the moment a run starts (before its first frame), and whenever
    // the scene's layout changes.
    const mo = new MutationObserver(measure);
    mo.observe(scene, { attributes: true, attributeFilter: ["data-run"] });
    const ro = new ResizeObserver(measure);
    ro.observe(scene);
    scene.querySelectorAll(variant === "phone" ? ".ixw-view, .ixw-inputs, .ixm-panel" : ".ix-panel, .ix-out-inner").forEach((el) => ro.observe(el));
    return () => {
      mo.disconnect();
      ro.disconnect();
      if (variant === "phone") {
        const view = root.closest<HTMLElement>(".ixw-view");
        clear(view, VIEW_VARS);
        clear(view?.querySelector<HTMLElement>(".ixw-inputs"), LIST_VARS);
        scene.querySelectorAll<HTMLElement>(".ixm-in").forEach((el) => clear(el, ["gy"]));
        scene.querySelectorAll<HTMLElement>(".ixm-panel-head, .ixm-row").forEach((el) => clear(el, ["fall"]));
      } else {
        clear(root.closest<HTMLElement>(".ix-out-inner"), DESK_VARS);
        scene.querySelectorAll<HTMLElement>(".ix-panel .ix-row").forEach((el) => clear(el, ["lift"]));
      }
    };
  }, [variant, lang]);

  return (
    <div ref={ref} className="hx-construction-fx">
      {variant === "phone" ? <Hook /> : <Crane />}
    </div>
  );
};

export default ConstructionFx;
