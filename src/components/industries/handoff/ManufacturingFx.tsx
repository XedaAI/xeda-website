import type React from "react";
import { useLayoutEffect, useRef } from "react";
import type { FxProps } from "./index";

// Manufacturing: the hand-off's set piece, a production line (see
// manufacturing.css). Rendered in the effects slot over the desktop result
// (.ix-fx, variant "desk") and over the phone window (.ixw-fx, variant
// "phone"). Decorative: the slot is aria-hidden.
//
//   phone    a conveyor slides in under the inputs; they drop onto it and are
//            carried off. The belt rises to the top of the result and works
//            its way down: each row rides in on it and a press stamps it into
//            place, while a gear turns in the panel's head.
//   desktop  a conveyor runs out of the Xeda node into a chute down the
//            panel's left edge, which feeds a line across the panel. Part
//            boxes ride out and drop down the chute; as each arrives its row
//            rides in on the line and a press stamps it; the line and the
//            press step down the panel row by row.
//
// Where everything goes depends on the laid-out scene (the industry, the
// language and the width), so it is measured here and handed to the CSS as
// custom properties, again whenever a run starts.

/** A gear outline: `teeth` trapezoid teeth around a circle of radius r. */
const gear = (cx: number, cy: number, r: number, teeth: number) => {
  const depth = r * 0.22;
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const ang = [a - step * 0.28, a - step * 0.14, a + step * 0.14, a + step * 0.28];
    const rad = [r - depth, r, r, r - depth];
    ang.forEach((t, j) => pts.push(`${(cx + rad[j] * Math.cos(t)).toFixed(2)} ${(cy + rad[j] * Math.sin(t)).toFixed(2)}`));
  }
  return `M${pts.join(" L")} Z`;
};
const COG = gear(12, 12, 10.5, 9);

const Cog = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d={COG} />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

/** A run of conveyor: a band whose cleats run forward on top and back
 *  underneath, and a turning roller at each end. */
const Belt = ({ className }: { className: string }) => (
  <span className={`hx-manufacturing-belt ${className}`}>
    <span className="hx-manufacturing-band">
      <span className="hx-manufacturing-slats" />
      <span className="hx-manufacturing-return" />
    </span>
    <Cog className="hx-manufacturing-roller hx-manufacturing-roller--a" />
    <Cog className="hx-manufacturing-roller hx-manufacturing-roller--b" />
  </span>
);

/** The part boxes on the desktop line, one per result row (four lines and the footer). */
const BOXES = 5;
/** The stations the press and the belt step through: the result's rows. */
const STATIONS = 5;

const px = (v: number) => `${Math.round(v * 10) / 10}px`;

/** An element's layout position inside `host` (an offset ancestor), ignoring
 *  transforms, so a row mid-animation still reports where it will land. */
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

const setVar = (el: HTMLElement, name: string, value: string) => el.style.setProperty(`--hx-manufacturing-${name}`, value);

/** Phone: the belt's line under the inputs, how far each input drops onto it
 *  (the lowest goes first), each row's top and bottom (where the press and
 *  the belt stop), and the spot in the panel's head where the gear turns. */
const measurePhone = (root: HTMLElement) => {
  const view = root.closest<HTMLElement>(".ixw-view");
  const list = view?.querySelector<HTMLElement>(".ixw-inputs");
  const result = view?.querySelector<HTMLElement>(".ixw-result");
  if (!view || !list || !result) return;
  const items = [...list.querySelectorAll<HTMLElement>(".ixm-in")];
  const bottoms = items.map((li) => offsetIn(li, view).y + li.offsetHeight);
  const line = (bottoms.length ? Math.max(...bottoms) : list.offsetTop + list.offsetHeight) + 3;
  setVar(root, "in", px(line));
  items.forEach((li, i) => {
    const fall = line - bottoms[i];
    setVar(li, "fall", px(fall));
    setVar(li, "at", `${120 + (items.length - 1 - i) * 100}ms`);
    setVar(li, "fallt", `${Math.round(80 + 8 * Math.sqrt(Math.max(fall, 0)))}ms`);
  });
  const rows = [...result.querySelectorAll<HTMLElement>(".ixm-panel > .ixm-row")];
  for (let k = 0; k < STATIONS; k++) {
    const row = rows[Math.min(k, rows.length - 1)];
    if (!row) break;
    const top = offsetIn(row, view).y - result.scrollTop;
    setVar(root, `t${k}`, px(top));
    setVar(root, `b${k}`, px(top + row.offsetHeight));
  }
  const meta = result.querySelector<HTMLElement>(".ixm-panel-meta");
  if (meta) {
    const m = offsetIn(meta, view);
    setVar(root, "gx", px(m.x + meta.offsetWidth - 10));
    setVar(root, "gy", px(m.y - result.scrollTop + meta.offsetHeight / 2));
  }
};

/** Desktop: where the node's own belt leaves it, the chute between the field
 *  list and the panel, each row's top, bottom and centre, and how far each
 *  box drops down the chute to its row. Relative to .ix-out-inner, which the
 *  slot fills. */
const measureDesk = (root: HTMLElement) => {
  const stage = root.closest<HTMLElement>(".ix-stage");
  const host = root.closest<HTMLElement>(".ix-out-inner");
  const node = stage?.querySelector<HTMLElement>(".ix-node");
  const panel = host?.querySelector<HTMLElement>(".ix-panel");
  if (!stage || !host || !node || !panel) return;
  const h = offsetIn(host, stage);
  const n = offsetIn(node, stage);
  const nodeRight = n.x + node.offsetWidth - h.x;
  // The node's instrument runs a belt at 84% of its height: this one continues it.
  const line = n.y - h.y + node.offsetHeight * 0.84;
  const fields = stage.querySelector<HTMLElement>(".ix-fields");
  const fieldsRight = fields ? offsetIn(fields, stage).x + fields.offsetWidth - h.x : nodeRight;
  const panelLeft = panel.offsetLeft;
  const chute = Math.min(panelLeft - 9, (Math.max(fieldsRight, nodeRight) + panelLeft) / 2);
  setVar(root, "nx", px(nodeRight));
  setVar(root, "by", px(line));
  setVar(root, "cx", px(chute));
  setVar(root, "px", px(panelLeft));
  setVar(root, "pb", px(panel.offsetTop + panel.offsetHeight));
  const rows = [...panel.querySelectorAll<HTMLElement>(":scope > .ix-row, :scope > .ix-foot")];
  const centres: number[] = [];
  for (let k = 0; k < STATIONS; k++) {
    const row = rows[Math.min(k, rows.length - 1)];
    if (!row) break;
    const top = offsetIn(row, host).y;
    setVar(root, `t${k}`, px(top));
    setVar(root, `b${k}`, px(top + row.offsetHeight));
    centres.push(top + row.offsetHeight / 2);
  }
  const centre = (k: number) => centres[Math.min(k, centres.length - 1)] ?? line;
  root.querySelectorAll<HTMLElement>(".hx-manufacturing-box").forEach((box, k) => setVar(box, "dy", px(Math.max(0, centre(k) - (line - 6)))));
  root.querySelectorAll<HTMLElement>(".hx-manufacturing-stop").forEach((stop, k) => setVar(stop, "y", px(centre(k) - line)));
};

const ManufacturingFx = ({ variant, lang }: FxProps) => {
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
    scene.querySelectorAll(variant === "phone" ? ".ixw-inputs, .ixm-panel" : ".ix-panel, .ix-node").forEach((el) => ro.observe(el));
    return () => {
      mo.disconnect();
      ro.disconnect();
      scene.querySelectorAll<HTMLElement>(".ixm-in").forEach((li) => {
        ["fall", "at", "fallt"].forEach((v) => li.style.removeProperty(`--hx-manufacturing-${v}`));
      });
    };
  }, [variant, lang]);

  if (variant === "phone") {
    return (
      <div ref={ref} className="hx-manufacturing-fx">
        <Belt className="hx-manufacturing-line" />
        <span className="hx-manufacturing-press" />
        <span className="hx-manufacturing-gear"><Cog className="hx-manufacturing-gear-art" /></span>
      </div>
    );
  }
  return (
    <div ref={ref} className="hx-manufacturing-fx">
      <Belt className="hx-manufacturing-out" />
      <span className="hx-manufacturing-chute">
        {Array.from({ length: STATIONS }, (_, k) => (
          <span key={k} className="hx-manufacturing-stop" style={{ "--k": k } as React.CSSProperties} />
        ))}
      </span>
      <Belt className="hx-manufacturing-station" />
      {Array.from({ length: BOXES }, (_, k) => (
        <span key={k} className="hx-manufacturing-box" style={{ "--k": k } as React.CSSProperties} />
      ))}
      <span className="hx-manufacturing-dpress" />
    </div>
  );
};

export default ManufacturingFx;
