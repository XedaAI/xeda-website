import type React from "react";
import { useLayoutEffect, useRef } from "react";
import { Check } from "lucide-react";
import { industries, tx, type InputItem, type Lx } from "../data";
import { HouseArt } from "../primitives";
import type { FxProps } from "./index";

// Real estate: the hand-off's set piece, "matched and booked" (see
// realestate.css). Rendered in the effects slot over the desktop result
// (.ix-fx, variant "desk") and over the phone window (.ixw-fx, variant
// "phone"). Decorative: the slot is aria-hidden.
//
//   phone    the inputs turn over one by one into cards (their backs in the
//            instrument's colour, a house on them) and slide together into
//            one deck in the middle of the window. The deck is turned over
//            and opens out into the lead card, whose rows are dealt in. A big
//            map pin drops from the top of the window onto the booked
//            viewing day, bounces and sends out two rings; the day lights up
//            with a "Matched" flash, and the pin settles into the small pin
//            the day keeps.
//   desktop  the inputs turn over into cards and are pulled into the Xeda
//            node. The node deals three listings onto the result side; the
//            one that fits the buyer is matched, the other two fly away. The
//            match turns over into the lead card, the rows are dealt onto
//            it, and a big pin drops from high above onto the booked
//            calendar slot ("Booked"), with a bounce and two rings.
//
// Where everything goes depends on the laid-out scene (the language and the
// width), so it is measured here and handed to the CSS as --hx-realestate-*
// custom properties: on the window (phone) or on the result's frame
// (desktop), so the result itself can use them too. Again whenever a run
// starts and whenever the layout changes.

const V = "--hx-realestate-";
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

const PHONE_VARS = ["dx", "dy", "oy", "ct", "cb", "px", "py", "fall", "lx"];
const DESK_VARS = ["nx", "ny", "pcx", "pcy", "cw", "ch", "mx", "my", "mk", "mky", "px", "py", "fall", "lx"];

/** Phone: the deck in the middle of the window (each input's way there), the
 *  strip of the result card the deck opens out from, and the booked day the
 *  pin lands on. Relative to the window (.ixw-view). */
const measurePhone = (root: HTMLElement) => {
  const view = root.closest<HTMLElement>(".ixw-view");
  const result = view?.querySelector<HTMLElement>(".ixw-result");
  const panel = result?.querySelector<HTMLElement>(".ixm-panel");
  if (!view || !result || !panel) return;
  const vw = view.clientWidth;
  const vh = view.clientHeight;
  const p = offsetIn(panel, view);
  const top = p.y - result.scrollTop;
  // The deck sits in the middle of the part of the result card on screen.
  const deckY = (Math.max(top, 0) + Math.min(top + panel.offsetHeight, vh)) / 2;
  const items = [...view.querySelectorAll<HTMLElement>(".ixw-inputs .ixm-in")];
  let ch = 0;
  items.forEach((li) => {
    const r = offsetIn(li, view);
    ch = Math.max(ch, li.offsetHeight);
    set(li, { dx: px(vw / 2 - (r.x + li.offsetWidth / 2)), dy: px(deckY - (r.y + li.offsetHeight / 2)) });
  });
  ch = Math.min(ch || 60, panel.offsetHeight);
  const oy = deckY - top;
  set(view, {
    oy: px(oy),
    ct: px(Math.max(0, oy - ch / 2)),
    cb: px(Math.max(0, panel.offsetHeight - oy - ch / 2)),
  });
  const day = panel.querySelector<HTMLElement>(".ixm-days .is-booked");
  if (!day) return;
  const d = offsetIn(day, view);
  const x = d.x + day.offsetWidth / 2;
  const y = d.y - result.scrollTop + 3;
  // The flash sits over the pin's head, kept inside the window.
  const half = (root.querySelector<HTMLElement>(".hx-realestate-flash")?.offsetWidth ?? 90) / 2;
  const lx = Math.min(Math.max(x, half + 8), vw - half - 8) - x;
  set(view, { px: px(x), py: px(y), fall: px(-(y + 90)), lx: px(lx) });
  // A booked day below the window's edge (a result that scrolls on a short
  // screen): no pin, rather than one that lands out of sight.
  root.toggleAttribute("data-off", y > vh - 8);
};

/** Desktop: the node the listings are dealt from, where they land (fanned
 *  out over the result), the match's place and size against the result
 *  card's (it turns into it), and the booked slot the pin lands on.
 *  Relative to the result's frame (.ix-out-inner), which the slot fills. */
const measureDesk = (root: HTMLElement) => {
  const stage = root.closest<HTMLElement>(".ix-stage");
  const host = root.closest<HTMLElement>(".ix-out-inner");
  const node = stage?.querySelector<HTMLElement>(".ix-node");
  const panel = host?.querySelector<HTMLElement>(".ix-panel");
  if (!stage || !host || !node || !panel) return;
  const h = offsetIn(host, stage);
  const n = offsetIn(node, stage);
  const pw = panel.offsetWidth;
  const ph = panel.offsetHeight;
  const pcx = panel.offsetLeft + pw / 2;
  const pcy = panel.offsetTop + ph / 2;
  const cw = Math.min(150, Math.max(112, pw * 0.31));
  const ch = Math.min(cw * 1.3, ph * 0.56);
  // The match rises a little out of the fan before it turns over.
  const my = -18;
  set(host, {
    nx: px(n.x - h.x + node.offsetWidth / 2),
    ny: px(n.y - h.y + node.offsetHeight / 2),
    pcx: px(pcx),
    pcy: px(pcy),
    cw: px(cw),
    ch: px(ch),
    mx: "0px",
    my: px(my),
    mk: String(Math.round(((cw * 1.06) / pw) * 1000) / 1000),
    mky: String(Math.round(((ch * 1.06) / ph) * 1000) / 1000),
  });
  const slot = panel.querySelector<HTMLElement>(".ix-cal-slot--booked");
  if (!slot) return;
  const s = offsetIn(slot, host);
  const x = s.x + slot.offsetWidth / 2;
  const y = s.y + 2;
  const half = (root.querySelector<HTMLElement>(".hx-realestate-flash")?.offsetWidth ?? 110) / 2;
  const lx = Math.min(Math.max(x, half + 6), host.offsetWidth - half - 6) - x;
  // From above the top of the stage, whatever the window's height.
  set(host, { px: px(x), py: px(y), fall: px(-(y + h.y + 100)), lx: px(lx) });
};

type Listing = { price: Lx | string; place: Lx | string };
const isListing = (it: InputItem): it is Extract<InputItem, { kind: "listing" }> => it.kind === "listing";
const input = industries.find((i) => i.key === "realestate")?.inputs.find(isListing);

/** The listing the buyer asked about (the one among the inputs), between
 *  two that do not fit her: over budget, and too small. Illustrative. */
const LISTINGS: Listing[] = [
  { price: { en: "€610,000", de: "610.000 €" }, place: { en: "4 rooms · Bogenhausen", de: "4 Zimmer · Bogenhausen" } },
  { price: input?.price ?? { en: "€525,000", de: "525.000 €" }, place: input?.place ?? { en: "3 rooms · Schwabing", de: "3 Zimmer · Schwabing" } },
  { price: { en: "€389,000", de: "389.000 €" }, place: { en: "2 rooms · Pasing", de: "2 Zimmer · Pasing" } },
];
const MATCH = 1;

const WORDS = {
  matched: { en: "Matched", de: "Treffer" },
  booked: { en: "Booked", de: "Gebucht" },
};

/** The map pin: a teardrop in the instrument's colour, a house in its head. */
const Pin = () => (
  <svg className="hx-realestate-pin" viewBox="0 0 40 52" aria-hidden="true">
    <path className="hx-realestate-pin-body" d="M20 50.5C17.2 46.4 4 31.4 4 19.5a16 16 0 0 1 32 0c0 11.9-13.2 26.9-16 31Z" />
    <path className="hx-realestate-pin-shine" d="M9.6 14.2a11.5 11.5 0 0 1 7.6-7.4" />
    <circle className="hx-realestate-pin-head" cx="20" cy="19.5" r="9.6" />
    <path className="hx-realestate-pin-house" d="M20 13.4 13.4 19h2v6.2h3.1v-3.8h3v3.8h3.1V19h2Z" />
  </svg>
);

/** The pin with its shadow, its two rings and the word it lands with. */
const Drop = ({ word }: { word: string }) => (
  <span className="hx-realestate-spot">
    <span className="hx-realestate-shadow" />
    <span className="hx-realestate-ring" />
    <span className="hx-realestate-ring hx-realestate-ring--2" />
    <span className="hx-realestate-drop"><Pin /></span>
    <span className="hx-realestate-flash"><Check className="hx-realestate-flash-icon" strokeWidth={3} />{word}</span>
  </span>
);

const RealestateFx = ({ variant, lang }: FxProps) => {
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
    scene.querySelectorAll(variant === "phone" ? ".ixw-view, .ixw-inputs, .ixm-panel" : ".ix-panel, .ix-node").forEach((el) => ro.observe(el));
    return () => {
      mo.disconnect();
      ro.disconnect();
      if (variant === "phone") {
        clear(root.closest<HTMLElement>(".ixw-view"), PHONE_VARS);
        scene.querySelectorAll<HTMLElement>(".ixm-in").forEach((li) => clear(li, ["dx", "dy"]));
      } else {
        clear(root.closest<HTMLElement>(".ix-out-inner"), DESK_VARS);
      }
    };
  }, [variant, lang]);

  if (variant === "phone") {
    return (
      <div ref={ref} className="hx-realestate-fx">
        <Drop word={tx(WORDS.matched, lang)} />
      </div>
    );
  }
  return (
    <div ref={ref} className="hx-realestate-fx">
      {LISTINGS.map((l, k) => (
        <span
          key={k}
          className={`hx-realestate-card ${k === MATCH ? "hx-realestate-card--match" : "hx-realestate-card--miss"}`}
          style={{ "--k": k } as React.CSSProperties}
        >
          <span className="hx-realestate-turn">
            <span className="hx-realestate-face">
              <span className="hx-realestate-photo"><HouseArt /></span>
              <span className="hx-realestate-price">{tx(l.price, lang)}</span>
              <span className="hx-realestate-place">{tx(l.place, lang)}</span>
            </span>
            <span className="hx-realestate-back" />
          </span>
          {k === MATCH && (
            <span className="hx-realestate-badge"><Check className="hx-realestate-flash-icon" strokeWidth={3} />{tx(WORDS.matched, lang)}</span>
          )}
        </span>
      ))}
      <Drop word={tx(WORDS.booked, lang)} />
    </div>
  );
};

export default RealestateFx;
