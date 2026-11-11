import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import type { FxProps } from "./index";

// Medical: "triage" (see medical.css for the timeline). A heartbeat monitor
// sweeps across the work and every request beats as the line passes it; the
// requests then arrive jumbled, each wearing its triage priority, sort
// themselves into order (rows swapping places) and the monitor gives one
// last steady beat across the result. Rendered in the effects slot over the
// desktop result (.ix-fx, variant "desk") and over the phone window
// (.ixw-fx, variant "phone"). Decorative: the slot is aria-hidden.
//
// The traces are drawn to the laid-out scene, measured here:
//   the monitor sweep  desktop: across the whole stage, its baseline through
//                      the middle of the result panel; phone: across the
//                      window, its baseline through the middle request
//   the last beat      along the line under the result panel's header
// and handed to the CSS as custom properties:
//   --hx-med-at       (per desktop input, and the node) when the sweep's
//                     line passes it, in ms from the click
//   --hx-med-qy       (per phone input) how far it moves to join the queue
//   --hx-med-mid      (per result row) its offset half way through the sort,
//                     once the most urgent request has moved to the top (the
//                     jumbled start, --from-px, comes from triage.ts)

/** The sweep's line crosses its width in this long (ms); it starts at
 *  SWEEP_AT. Desktop: from the click. Phone: from the end of the scan. */
const SWEEP = { desk: { at: 40, head: 900 }, phone: { at: 40, head: 560 } } as const;

/** The order the requests are in once the most urgent has moved to the top
 *  (row indices, top to bottom): half way from triage.ts's jumble
 *  [2, 0, 3, 1] to the sorted [0, 1, 2, 3]. */
const MID_ORDER = [0, 2, 3, 1];

type Trace = {
  /** The box the trace is drawn in, in the slot's coordinates (px). */
  x: number; y: number; w: number; h: number;
  /** The baseline (px from the box's top) and the beats' heights. */
  base: number; up: number; down: number;
  /** Where the beats are, as shares of the width; how wide one is. */
  beats: number[]; k: number;
};
type Geo = { sweep: Trace; pulse: Trace };

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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

/** A heartbeat trace across the width: a flat baseline with a beat (a small
 *  P wave, the tall R spike between the Q and S dips, a rounded T wave)
 *  centred at each of `beats`. `k` scales a beat's width. */
const ecgPath = ({ w, base, up, down, beats, k }: Trace) => {
  const p = (x: number, y: number) => `${r1(x)} ${r1(y)}`;
  let d = `M${p(0, base)}`;
  for (const f of beats) {
    const x = f * w;
    d += ` L${p(x - 34 * k, base)} Q${p(x - 28 * k, base - up * 0.14)} ${p(x - 22 * k, base)}`;
    d += ` L${p(x - 10 * k, base)} L${p(x - 6 * k, base + down * 0.28)} L${p(x, base - up)}`;
    d += ` L${p(x + 6 * k, base + down)} L${p(x + 10 * k, base)} L${p(x + 19 * k, base)}`;
    d += ` Q${p(x + 29 * k, base - up * 0.26)} ${p(x + 39 * k, base)}`;
  }
  return `${d} L${p(w, base)}`;
};

/** One monitor sweep: the trace drawn left to right behind a bright line,
 *  fading out behind it. */
const Sweep = ({ t, kind }: { t: Trace; kind: "intro" | "pulse" }) => (
  <span
    className={`hx-medical-sweep hx-medical-sweep--${kind}`}
    style={{
      left: t.x, top: t.y, width: t.w, height: t.h,
      "--hx-med-base": `${r1(t.base)}px`,
    } as React.CSSProperties}
  >
    <span className="hx-medical-trail">
      <svg className="hx-medical-trace" width={t.w} height={t.h} viewBox={`0 0 ${r1(t.w)} ${r1(t.h)}`}>
        <path className="hx-medical-glow" d={ecgPath(t)} />
        <path className="hx-medical-line" d={ecgPath(t)} />
      </svg>
    </span>
    <span className="hx-medical-head" />
  </span>
);

const FLASH = { en: "Sorted by priority", de: "Nach Dringlichkeit sortiert" } as const;

const MedicalFx = ({ variant, lang }: FxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    const scene = root?.closest<HTMLElement>(".ix-scene");
    const frame = root?.closest<HTMLElement>(variant === "phone" ? ".ixw-view" : ".ix-out-inner");
    if (!root || !scene || !frame) return;
    const desk = variant === "desk";
    const touched = new Set<HTMLElement>();
    const setVar = (el: HTMLElement, k: string, v: string) => { el.style.setProperty(k, v); touched.add(el); };
    let last = "";

    const measure = () => {
      // The sort's half-way offsets, measured like triage.ts measures the
      // jumbled start (the rows differ in height).
      const rows = [...frame.querySelectorAll<HTMLElement>(desk ? ".ix-panel .ix-row" : ".ixw-result .ixm-row")];
      if (rows.length === MID_ORDER.length) {
        const tops = rows.map((r) => r.offsetTop);
        let y = Math.min(...tops);
        MID_ORDER.forEach((i) => {
          setVar(rows[i], "--hx-med-mid", `${Math.round(y - tops[i])}px`);
          y += rows[i].offsetHeight;
        });
      }

      let next: Geo | null = null;
      if (desk) {
        const panel = frame.querySelector<HTMLElement>(".ix-panel");
        const at = offsetIn(frame, scene);
        if (!panel || !at) return;
        const W = scene.clientWidth;
        const H = scene.clientHeight;
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;
        // The line passes x at this time (ms from the click).
        const passes = (x: number) => Math.round(SWEEP.desk.at + (x / W) * SWEEP.desk.head);
        scene.querySelectorAll<HTMLElement>("[data-ix-input]").forEach((el) => {
          const p = offsetIn(el, scene);
          if (p) setVar(el, "--hx-med-at", `${passes(p.x + el.offsetWidth / 2)}ms`);
        });
        const node = scene.querySelector<HTMLElement>(".ix-node");
        const np = node && offsetIn(node, scene);
        if (node && np) setVar(node, "--hx-med-at", `${passes(np.x + node.offsetWidth / 2)}ms`);
        // A beat every ~190px, one of them over the middle of the panel.
        const mid = at.x + pw / 2;
        const beats: number[] = [];
        for (let x = mid - Math.floor((mid - 60) / 190) * 190; x < W - 40; x += 190) beats.push(x / W);
        const up = clamp(ph * 0.34, 60, 115);
        const head = (panel.firstElementChild as HTMLElement | null)?.offsetHeight ?? 48;
        next = {
          sweep: { x: -at.x, y: -at.y, w: W, h: H, base: at.y + ph / 2, up, down: up * 0.45, beats, k: 1.35 },
          pulse: { x: 0, y: 0, w: pw, h: ph, base: head, up: 15, down: 8, beats: [0.5], k: 0.85 },
        };
      } else {
        const inputs = [...frame.querySelectorAll<HTMLElement>(".ixm-in")];
        const result = frame.querySelector<HTMLElement>(".ixw-result");
        const panel = result?.querySelector<HTMLElement>(".ixm-panel");
        const headEl = panel?.querySelector<HTMLElement>(".ixm-panel-head");
        const pp = panel && offsetIn(panel, frame);
        if (inputs.length < 2 || !panel || !headEl || !pp) return;
        const W = frame.clientWidth;
        const H = frame.clientHeight;
        const box = inputs.map((li) => {
          const p = offsetIn(li, frame);
          return { y: (p?.y ?? 0) + li.offsetHeight / 2, h: li.offsetHeight };
        });
        const m = Math.floor((inputs.length - 1) / 2);
        const base = box[m].y;
        // The queue: the requests shrink (QS) to a short stack at the
        // window's left edge, centred on the middle one.
        const QS = 0.42;
        let qy = base - box.slice(0, m).reduce((s, b) => s + b.h * QS + 5, 0) - (box[m].h * QS) / 2;
        inputs.forEach((li, i) => {
          const target = qy + (box[i].h * QS) / 2;
          setVar(li, "--hx-med-qy", `${Math.round(target - box[i].y)}px`);
          qy += box[i].h * QS + 5;
        });
        const up = clamp((base - box[0].y) * 0.95, 34, 90);
        const down = clamp(((box[inputs.length - 1]?.y ?? base) - base) * 0.55, 16, 48);
        next = {
          sweep: { x: 0, y: 0, w: W, h: H, base, up, down, beats: [0.2, 0.5, 0.8], k: 1 },
          pulse: { x: pp.x, y: pp.y, w: panel.offsetWidth, h: panel.offsetHeight, base: headEl.offsetHeight, up: 13, down: 7, beats: [0.5], k: 0.8 },
        };
      }
      const key = JSON.stringify(next);
      if (key !== last) {
        last = key;
        setGeo(next);
      }
    };

    measure();
    // Again whenever the layout moves (fonts, wrapping, the window's size)
    // and as each run starts, so the traces and offsets meet the real
    // elements.
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    ro.observe(scene);
    frame.querySelectorAll(".ix-panel, .ixm-panel, .ixw-inputs").forEach((el) => ro.observe(el));
    const mo = new MutationObserver(measure);
    mo.observe(scene, { attributes: true, attributeFilter: ["data-run"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
      touched.forEach((el) => {
        el.style.removeProperty("--hx-med-at");
        el.style.removeProperty("--hx-med-qy");
        el.style.removeProperty("--hx-med-mid");
      });
    };
  }, [variant, lang]);

  return (
    <div ref={ref} className={`hx-medical hx-medical--${variant}`}>
      {geo && <Sweep t={geo.sweep} kind="intro" />}
      {geo && <Sweep t={geo.pulse} kind="pulse" />}
      {variant === "desk" && (
        <span className="hx-medical-flash">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 4h12M2 8h8M2 12h4" />
          </svg>
          {FLASH[lang]}
        </span>
      )}
    </div>
  );
};

export default MedicalFx;
