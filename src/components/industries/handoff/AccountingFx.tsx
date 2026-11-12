import { useLayoutEffect, useRef } from "react";
import { industries, tx } from "../data";
import type { FxProps } from "./index";

// Accounting: "print and post" (see accounting.css). A printer slot drops
// over the work; the scattered papers are fed into it, the organised batch is
// printed out of it line by line, and the batch is stamped POSTED with a
// thump. Rendered in the effects slot over the desktop result (.ix-fx,
// variant "desk") and over the phone window (.ixw-fx, variant "phone").
// Decorative: the slot is aria-hidden.
//
// The parts are placed from the laid-out scene, measured here and handed to
// the CSS as custom properties:
//   --hx-acc-sx/-sy/-sw/-sh  the real stamp's centre and size, so the big
//                            stamp slams down exactly where it lands
//   --hx-acc-rt/-rh          phone: the result layer's top and height, so
//                            the print bar rides the edge of the reveal
//   --hx-acc-up (per input)  phone: how far each input travels up to the
//                            printer's mouth

const STAMP = (() => {
  const o = industries.find((x) => x.key === "accounting")?.output;
  return o?.kind === "table" ? o.stamp : undefined;
})();

/** Where `el` sits inside `frame` (a positioned ancestor), from layout
 *  offsets: transforms and running animations do not move it. */
const offsetIn = (el: HTMLElement, frame: HTMLElement) => {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== frame) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return n === frame ? { x, y } : null;
};

const AccountingFx = ({ variant, lang }: FxProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    const frame = root?.closest<HTMLElement>(variant === "phone" ? ".ixw-view" : ".ix-out-inner");
    const scene = root?.closest<HTMLElement>(".ix-scene");
    if (!root || !frame || !scene) return;
    const slot = root.querySelector<HTMLElement>(".hx-accounting-slot");
    const result = variant === "phone" ? frame.querySelector<HTMLElement>(".ixw-result") : null;
    const inputs = variant === "phone" ? [...frame.querySelectorAll<HTMLElement>(".ixm-in")] : [];

    const measure = () => {
      const set = (k: string, v: number) => root.style.setProperty(k, `${Math.round(v * 10) / 10}px`);
      const stamp = frame.querySelector<HTMLElement>(".ix-stamp");
      const at = stamp && offsetIn(stamp, frame);
      if (stamp && at) {
        let cy = at.y + stamp.offsetHeight / 2;
        // Phone: a result that scrolls inside a short window can hide its
        // last row; the stamp then lands at the window's lower edge.
        if (result) {
          const bottom = result.offsetTop + result.clientHeight - stamp.offsetHeight;
          cy = Math.min(cy, bottom);
        }
        set("--hx-acc-sx", at.x + stamp.offsetWidth / 2);
        set("--hx-acc-sy", cy);
        set("--hx-acc-sw", stamp.offsetWidth);
        set("--hx-acc-sh", stamp.offsetHeight);
        // Desktop: the big stamp starts at up to 3.8 times its size, but no
        // bigger than the stage has room for around it (it clips the stage).
        const stage = variant === "desk" ? frame.closest<HTMLElement>(".ix-stage") : null;
        if (stage) {
          const s = stage.getBoundingClientRect();
          const r = stamp.getBoundingClientRect(); // its centre: it turns about it
          const cx = r.left + r.width / 2 - s.left;
          const cy = r.top + r.height / 2 - s.top;
          const w = stamp.offsetWidth;
          const h = stamp.offsetHeight;
          // Half its size turned by the -13deg it comes down at.
          const halfW = 0.487 * w + 0.113 * h;
          const halfH = 0.113 * w + 0.487 * h;
          const room = Math.min(cx, s.width - cx, cy, s.height - cy) - 6;
          const big = Math.min(3.8, room / halfW, (Math.min(cy, s.height - cy) - 6) / halfH);
          root.style.setProperty("--hx-acc-big", String(Math.round(Math.max(1.6, big) * 100) / 100));
        }
      }
      if (result) {
        set("--hx-acc-rt", result.offsetTop);
        set("--hx-acc-rh", result.offsetHeight);
      }
      if (slot && inputs.length) {
        const mouth = slot.offsetTop + slot.offsetHeight;
        inputs.forEach((li) => {
          const p = offsetIn(li, frame);
          if (p) li.style.setProperty("--hx-acc-up", `${Math.max(0, Math.round(p.y - mouth))}px`);
        });
      }
    };

    measure();
    // Again whenever the layout moves (fonts, wrapping, the window's size)
    // and as each run starts, so the parts meet the real elements.
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    const panel = frame.querySelector(".ixm-panel, .ix-panel");
    if (panel) ro.observe(panel);
    if (result) ro.observe(result);
    const mo = new MutationObserver(measure);
    mo.observe(scene, { attributes: true, attributeFilter: ["data-run"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
      inputs.forEach((li) => li.style.removeProperty("--hx-acc-up"));
    };
  }, [variant, lang]);

  return (
    <div ref={ref} className={`hx-accounting hx-accounting--${variant}`}>
      {/* The printer: a dark housing with a glowing mouth, the light it
          spills downwards, and a status light. */}
      <span className="hx-accounting-slot">
        <span className="hx-accounting-spill" />
        <span className="hx-accounting-mark">Xeda</span>
        <span className="hx-accounting-led" />
      </span>
      {/* The print bar riding the edge of what has been printed. */}
      <span className="hx-accounting-bar" />
      {/* The stamp coming down, and the ink ring where it hits. */}
      <span className="hx-accounting-hit">
        <span className="hx-accounting-ring" />
        <span className="hx-accounting-ring hx-accounting-ring--late" />
        {STAMP && <span className="hx-accounting-stamp">{tx(STAMP, lang)}</span>}
      </span>
    </div>
  );
};

export default AccountingFx;
