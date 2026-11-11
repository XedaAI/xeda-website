import type React from "react";
import { useLayoutEffect, useRef } from "react";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import type { FxProps } from "./index";

// E-commerce: "packed and shipped" (see ecommerce.css for the timeline).
//
// Phone: an open carton rises into the window, the requests drop into it one
// by one, the flaps close, tape runs across, the red scanner reads its label
// and it slides away; the result is delivered from above and unboxed row by
// row under the scanner, the van driving along the tracking steps.
// Desktop: the same carton opens beside Xeda and the scattered requests are
// tossed into it; it is sealed, scanned and pushed into Xeda, and parcels come
// out the other side along the data paths, one per row of the result; each
// row unboxes as its parcel lands, under the red laser, and the van drives
// along the tracking steps.
//
// Rendered in the effects slot over the phone window (.ixw-fx, "phone") and
// over the desktop result (.ix-fx, "desk"). Decorative: the slot is
// aria-hidden. What it measures it writes as custom properties, and it takes
// them off again when it goes.

/** The carton's drawing (viewBox 0 0 200 190): its mouth, where the
 *  requests drop in, runs along y = 92 and is 124 wide inside the flaps. */
const BOX = { w: 200, h: 190, mouthY: 92, mouthW: 124 };
/** How far a falling request is kept visible past its own edges (its read
 *  tick, badge and shadow stick out), in px; ecommerce.css uses the same. */
const PAD = 20;
const DROP_VARS = ["--hx-ax", "--hx-ay", "--hx-ar", "--hx-as", "--hx-mx", "--hx-my", "--hx-ey", "--hx-ms"];

const px = (n: number) => `${n.toFixed(1)}px`;
const clamp = (lo: number, v: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Pt = { x: number; y: number };

/** The way one request is tossed into the carton, as the custom properties
 *  of its keyframes (ecommerce.css, hx-ecommerce-toss): up to an apex, then
 *  down to the carton's mouth (shrunk to fit it), then down through it while
 *  the part below the mouth is clipped away. Its transform turns about its
 *  top left corner, `tl` (where it is laid out, untransformed); `rest` is
 *  its own resting turn and scale. */
const tossInto = (
  el: HTMLElement,
  tl: Pt,
  rest: { deg: number; scale: number },
  mouth: Pt & { w: number },
  hop: number,
) => {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h) return;
  // Where the transform puts the middle of the card, turned by `deg` and
  // scaled by `k` about its top left corner.
  const middle = (deg: number, k: number) => {
    const a = (deg * Math.PI) / 180;
    const hx = (k * w) / 2;
    const hy = (k * h) / 2;
    return { x: hx * Math.cos(a) - hy * Math.sin(a), y: hx * Math.sin(a) + hy * Math.cos(a) };
  };
  // The translation that brings the card's middle to `p`.
  const to = (p: Pt, deg: number, k: number) => {
    const m = middle(deg, k);
    return { x: p.x - tl.x - m.x, y: p.y - tl.y - m.y };
  };
  const m0 = middle(rest.deg, rest.scale);
  const c = { x: tl.x + m0.x, y: tl.y + m0.y };
  const k = Math.min(0.5, (mouth.w * 0.8) / w);
  const ka = (rest.scale + k) / 2;
  const turn = rest.deg + (mouth.x >= c.x ? 9 : -9);
  const apex = to({ x: c.x + (mouth.x - c.x) * 0.5, y: Math.min(c.y, mouth.y - 0.6 * hop) - hop }, turn, ka);
  const atMouth = to({ x: mouth.x, y: mouth.y - (k * h) / 2 }, 0, k);
  const inside = to({ x: mouth.x, y: mouth.y + k * (h / 2 + PAD) }, 0, k);
  el.style.setProperty("--hx-ax", px(apex.x));
  el.style.setProperty("--hx-ay", px(apex.y));
  el.style.setProperty("--hx-ar", `${turn.toFixed(1)}deg`);
  el.style.setProperty("--hx-as", ka.toFixed(3));
  el.style.setProperty("--hx-mx", px(atMouth.x));
  el.style.setProperty("--hx-my", px(atMouth.y));
  el.style.setProperty("--hx-ey", px(inside.y));
  el.style.setProperty("--hx-ms", k.toFixed(3));
};

/** Re-run `place` whenever the layout it reads may have moved: on mount, on
 *  any resize of `watch`, and each time a run starts (data-run is set). */
const useMeasure = (
  rootRef: React.RefObject<HTMLElement>,
  setup: (root: HTMLElement) => { place: () => void; watch: Element[]; cleanup: () => void } | null,
  deps: React.DependencyList,
) => {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const scene = root?.closest<HTMLElement>(".ix-scene");
    const s = root && scene ? setup(root) : null;
    if (!s || !scene) return;
    s.place();
    const ro = new ResizeObserver(() => s.place());
    s.watch.forEach((el) => ro.observe(el));
    const mo = new MutationObserver(() => { if (scene.hasAttribute("data-run")) s.place(); });
    mo.observe(scene, { attributes: true, attributeFilter: ["data-run"] });
    return () => { ro.disconnect(); mo.disconnect(); s.cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/* --- The carton (phone and desktop) -------------------------------------- */

const BARS = [0, 3, 5, 9, 11, 14, 18, 20, 23, 27, 29, 32, 35, 38, 40, 43];

const Carton = () => (
  <svg className="hx-ecommerce-art" viewBox={`0 0 ${BOX.w} ${BOX.h}`} aria-hidden="true">
    <ellipse className="hx-ecommerce-floor" cx="100" cy="183" rx="84" ry="6" />
    {/* Open: the back flap standing, the inside, the side flaps splayed. */}
    <polygon className="hx-ecommerce-k-in hx-ecommerce-back-open" points="46,70 154,70 168,34 32,34" />
    <polygon className="hx-ecommerce-hole" points="30,92 170,92 154,70 46,70" />
    <polygon className="hx-ecommerce-k-top hx-ecommerce-wing hx-ecommerce-wing--l" points="30,92 46,70 18,48 2,72" />
    <polygon className="hx-ecommerce-k-top hx-ecommerce-wing hx-ecommerce-wing--r" points="170,92 154,70 182,48 198,72" />
    {/* The body: front face, handling arrows, shipping label. */}
    <rect className="hx-ecommerce-k" x="30" y="92" width="140" height="88" rx="2" />
    <rect className="hx-ecommerce-shade" x="30" y="150" width="140" height="30" rx="2" />
    <path className="hx-ecommerce-arrows" d="M48 146 V126 M42 132 L48 125 L54 132 M62 146 V126 M56 132 L62 125 L68 132 M40 152 H70" />
    <g className="hx-ecommerce-label">
      <rect className="hx-ecommerce-label-bg" x="98" y="120" width="60" height="44" rx="3" />
      <rect className="hx-ecommerce-label-ink" x="104" y="125" width="26" height="3" rx="1" />
      <rect className="hx-ecommerce-label-ink" x="104" y="131" width="18" height="3" rx="1" />
      <g className="hx-ecommerce-bars">
        {BARS.map((x, i) => <rect key={x} x={104 + x} y="139" width={i % 3 === 0 ? 2 : 1.2} height="19" />)}
      </g>
      <rect className="hx-ecommerce-label-flash" x="98" y="120" width="60" height="44" rx="3" />
    </g>
    {/* The front flap, hanging open over the face. */}
    <polygon className="hx-ecommerce-k-top hx-ecommerce-front-open" points="30,92 170,92 170,111 30,111" />
    {/* Closed: the two long flaps meeting along a seam, taped. */}
    <polygon className="hx-ecommerce-k-top hx-ecommerce-back-shut" points="46,70 154,70 162,81 38,81" />
    <polygon className="hx-ecommerce-k-lid hx-ecommerce-front-shut" points="30,92 170,92 162,81 38,81" />
    <rect className="hx-ecommerce-tape" x="34" y="77.5" width="132" height="7" rx="1" />
  </svg>
);

/** The carton with its scanner, the green "read" tick and the speed lines
 *  it leaves behind as it goes. */
const CartonRig = ({ boxRef }: { boxRef: React.RefObject<HTMLDivElement> }) => (
  <div ref={boxRef} className="hx-ecommerce-box">
    <span className="hx-ecommerce-streaks"><span /><span /><span /></span>
    <div className="hx-ecommerce-squash">
      <Carton />
      <span className="hx-ecommerce-scan" />
    </div>
    <span className="hx-ecommerce-ok">
      <svg viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" /></svg>
    </span>
  </div>
);

/* --- Phone ---------------------------------------------------------------- */

const PhoneFx = ({ lang }: { lang: SiteLanguage }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Each request falls from where it lies into the carton. Measured from
  // layout positions (offsets), so a run in progress does not skew them;
  // the carton itself only ever moves by transform.
  useMeasure(rootRef, (root) => {
    const box = boxRef.current;
    const view = root.closest<HTMLElement>(".ixw-view");
    const list = view?.querySelector<HTMLElement>(".ixw-inputs");
    if (!box || !view || !list) return null;
    const items = [...list.querySelectorAll<HTMLElement>(".ixm-in")];
    const place = () => {
      const v = view.getBoundingClientRect();
      const bw = box.offsetWidth;
      const bh = box.offsetHeight;
      const mouth = {
        x: v.left + view.clientLeft + box.offsetLeft + bw / 2,
        y: v.top + view.clientTop + box.offsetTop + bh * (BOX.mouthY / BOX.h),
        w: bw * (BOX.mouthW / BOX.w),
      };
      items.forEach((li) => {
        const tl = {
          x: v.left + view.clientLeft + list.offsetLeft + li.offsetLeft,
          y: v.top + view.clientTop + list.offsetTop + li.offsetTop,
        };
        // By the end of the scan every request lies straight (no transform).
        tossInto(li, tl, { deg: 0, scale: 1 }, mouth, 18);
      });
    };
    return {
      place,
      watch: [view, list, ...items],
      cleanup: () => items.forEach((li) => DROP_VARS.forEach((v) => li.style.removeProperty(v))),
    };
  }, [lang]);

  return (
    <div ref={rootRef} className="hx-ecommerce-ph">
      <CartonRig boxRef={boxRef} />
    </div>
  );
};

/* --- Desktop -------------------------------------------------------------- */

/** A small parcel, seen from above at an angle, taped along its lid. */
const Parcel = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <polygon className="hx-ecommerce-k-top" points="16,4 29,10.5 16,17 3,10.5" />
    <polygon className="hx-ecommerce-k" points="3,10.5 16,17 16,31 3,24.5" />
    <polygon className="hx-ecommerce-k-in" points="16,17 29,10.5 29,24.5 16,31" />
    <polygon className="hx-ecommerce-tape" points="7.9,8 11.1,6.5 24.1,13 20.9,14.5" />
    <polygon className="hx-ecommerce-tape" points="20.9,14.5 24.1,13 24.1,27 20.9,28.5" />
    <polygon className="hx-ecommerce-label-bg" points="5.5,15.5 12,18.8 12,24 5.5,20.7" />
  </svg>
);

/** One parcel per result row, and one for the tracking line. */
const PARCELS = 5;

const DeskFx = ({ lang }: { lang: SiteLanguage }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useMeasure(rootRef, (root) => {
    const box = boxRef.current;
    const stage = root.closest<HTMLElement>(".ix-stage");
    const panel = stage?.querySelector<HTMLElement>(".ix-panel");
    const zone = stage?.querySelector<HTMLElement>(".ix-in");
    const holder = stage?.querySelector<HTMLElement>(".ix-items");
    if (!box || !stage || !panel || !zone || !holder) return null;
    const cards = [...holder.querySelectorAll<HTMLElement>(".ix-item")];
    const parcels = [...root.querySelectorAll<HTMLElement>(".hx-ecommerce-parcel")];
    const place = () => {
      const nodeEl = stage.querySelector<HTMLElement>(".ix-node");
      if (!nodeEl) return;
      const base = root.getBoundingClientRect();
      const node = nodeEl.getBoundingClientRect();
      const z = zone.getBoundingClientRect();

      // The carton: in the scattered side, just short of Xeda, standing on
      // the node's baseline; pushed into the node once it is sealed.
      const cw = clamp(112, z.width * 0.4, 180);
      const ch = cw * (BOX.h / BOX.w);
      const left = node.left - Math.max(14, cw * 0.12) - cw;
      const top = node.bottom + cw * 0.05 - ch;
      box.style.setProperty("--hx-bx", px(left - base.left));
      box.style.setProperty("--hx-by", px(top - base.top));
      box.style.setProperty("--hx-bw", px(cw));
      box.style.setProperty("--hx-px", px(node.left + node.width / 2 - (left + cw / 2)));
      box.style.setProperty("--hx-py", px(node.top + node.height / 2 - (top + ch * 0.62)));

      // The requests: tossed into it from where they lie.
      const h = holder.getBoundingClientRect();
      const mouth = { x: left + cw / 2, y: top + ch * (BOX.mouthY / BOX.h), w: cw * (BOX.mouthW / BOX.w) };
      cards.forEach((el) => {
        const scale = parseFloat(getComputedStyle(el).getPropertyValue("--s")) || 1;
        const deg = parseFloat(el.style.getPropertyValue("--r")) || 0;
        tossInto(el, { x: h.left + el.offsetLeft, y: h.top + el.offsetTop }, { deg, scale }, mouth, 34);
      });

      // Each parcel's flight: out of the node's right edge, curving like the
      // data paths, to the start of its row (the tracking line: its van).
      const p = panel.getBoundingClientRect();
      const targets: Pt[] = [...panel.querySelectorAll<HTMLElement>(".ix-row")].map((r) => {
        const b = r.getBoundingClientRect();
        return { x: b.left + 26, y: b.top + b.height / 2 };
      });
      const van = panel.querySelector(".ix-foot svg")?.getBoundingClientRect();
      if (van) targets.push({ x: van.left + van.width / 2 + 4, y: van.top + van.height / 2 });
      parcels.forEach((el, i) => {
        const t = targets[i];
        if (!t) { el.style.removeProperty("offset-path"); return; }
        const sx = node.right - base.left - 18;
        const sy = node.top + node.height / 2 - base.top + (i - (PARCELS - 1) / 2) * 8;
        const ex = t.x - base.left;
        const ey = t.y - base.top;
        const mx = (sx + p.left - base.left) / 2;
        el.style.setProperty("offset-path", `path("M${sx.toFixed(1)} ${sy.toFixed(1)} C${mx.toFixed(1)} ${(sy - 40).toFixed(1)} ${mx.toFixed(1)} ${ey.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}")`);
      });
    };
    return {
      place,
      watch: [stage, panel, holder],
      cleanup: () => {
        parcels.forEach((el) => el.style.removeProperty("offset-path"));
        cards.forEach((el) => DROP_VARS.forEach((v) => el.style.removeProperty(v)));
      },
    };
  }, [lang]);

  return (
    <div ref={rootRef} className="hx-ecommerce-desk">
      <CartonRig boxRef={boxRef} />
      {Array.from({ length: PARCELS }, (_, i) => (
        <span key={i} className="hx-ecommerce-parcel" style={{ "--k": i } as React.CSSProperties}>
          <span className="hx-ecommerce-parcel-body"><Parcel /></span>
          <span className="hx-ecommerce-burst" />
        </span>
      ))}
    </div>
  );
};

const EcommerceFx = ({ variant, lang }: FxProps) =>
  variant === "phone" ? <PhoneFx lang={lang} /> : <DeskFx lang={lang} />;

export default EcommerceFx;
