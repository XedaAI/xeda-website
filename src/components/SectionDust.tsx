import { useEffect, useRef } from "react";

// Dust that belongs to two sections and travels between them.
//
// It frames the FIRST section while you are at or above it, streams down the
// left and right edges of the screen while you scroll between the two, and
// gathers into a frame around the SECOND when you arrive. Scroll back up and
// the whole thing runs in reverse. Past either end it simply stays framed —
// there is nothing further to travel to.
//
// One number drives all of it. `p` is where the viewport's centre sits between
// the two sections' centres, clamped to 0..1, so it is a position rather than
// an event: it cannot get out of step with the page, there is nothing to reset,
// and reversing direction reverses the motion for free.
//
//   p = 0      framed on the first section
//   0 < p < 1  out at the screen edges, sweeping upward as p grows
//   p = 1      framed on the second
//
// `edge` ramps in over the first and last sixth of that range, which is what
// makes it read as bursting outward and gathering back in rather than sliding
// along a diagonal. Every particle eases toward its target instead of being
// placed on it, so the bursting and the gathering both take a moment.

/** Ramp in and out over this much of the journey at each end. */
const RAMP = 0.16;
/** How far from the screen's sides the stream runs, CSS px. */
const EDGE_PAD = 26;
/** How far outside a section's box the frame sits, CSS px. */
const FRAME_OUT = 14;
/** The frame never goes closer than this to the screen's sides. Content blocks
    are often full-bleed, and an unclamped frame put its left and right runs off
    the screen entirely — three sides of a frame, and an asymmetric three at
    that, since a scrollbar makes the box off-centre. */
const FRAME_INSET = 16;
/** Per-frame follow. Lower is lazier; .07 takes roughly half a second. */
const EASE = 0.07;
/** Alpha buckets — one fillStyle change per bucket, not one per particle. */
const LEVELS = 5;
const MAX_ALPHA = 0.55;

interface P {
  /** Position around the frame's perimeter, 0..1. */
  t: number;
  /** -1 runs down the left edge, +1 the right. */
  side: number;
  /** Lane in the edge stream, 0..1. */
  lane: number;
  jx: number;
  jy: number;
  a: number;
  sz: number;
  x: number;
  y: number;
  /** False until it has been placed once, so it does not fly in from 0,0. */
  placed: boolean;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Point at `t` around a box's perimeter, pushed outward by FRAME_OUT. */
const onPerimeter = (b: Box, t: number, out: { x: number; y: number }) => {
  const w = b.right - b.left;
  const h = b.bottom - b.top;
  const per = 2 * (w + h);
  let d = t * per;
  if (d < w) {
    out.x = b.left + d;
    out.y = b.top - FRAME_OUT;
  } else if ((d -= w) < h) {
    out.x = b.right + FRAME_OUT;
    out.y = b.top + d;
  } else if ((d -= h) < w) {
    out.x = b.right - d;
    out.y = b.bottom + FRAME_OUT;
  } else {
    out.x = b.left - FRAME_OUT;
    out.y = b.bottom - (d - w);
  }
};

const smooth = (x: number) => x * x * (3 - 2 * x);

interface SectionDustProps {
  /** id of the section it frames at the top of the journey. */
  fromId: string;
  /** id of the section it frames at the bottom. */
  toId: string;
}

const SectionDust = ({ fromId, toId }: SectionDustProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Frame the content block, not the full-bleed <section>: a section's own
    // edges ARE the screen's edges, so framing one looks identical to the
    // travelling state and the burst never reads. Each section marks the block
    // worth framing with data-dust-frame.
    const framed = (id: string): HTMLElement | null => {
      const sec = document.getElementById(id);
      if (!sec) return null;
      return sec.querySelector<HTMLElement>("[data-dust-frame]") ?? sec;
    };

    let from = framed(fromId);
    let to = framed(toId);
    if (!from || !to) return;

    // The colour comes from the element, so one CSS rule keeps it legible in
    // both themes. Re-read only when the theme actually changes — reading
    // computed style every frame would force a style recalc every frame.
    let ink = "#F2F3F5";
    const readInk = () => {
      ink = getComputedStyle(canvas).color || ink;
    };
    const themeWatch = new MutationObserver(readInk);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    let vw = 0;
    let vh = 0;
    let dpr = 1;
    let ps: P[] = [];
    const bufs: Float32Array[] = [];
    const counts = new Int32Array(LEVELS);

    const size = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = Math.round(Math.min(Math.max(vw / 7, 80), 190));
      if (ps.length !== n) {
        ps = Array.from({ length: n }, (_, i) => ({
          // Evenly spaced around the frame, jittered so it reads as dust
          // settled along an edge rather than as a dotted border.
          t: (i + Math.random() * 0.7) / n,
          side: i % 2 === 0 ? -1 : 1,
          lane: Math.random(),
          jx: (Math.random() - 0.5) * 20,
          jy: (Math.random() - 0.5) * 20,
          a: 0.3 + Math.random() * 0.7,
          sz: Math.random() < 0.22 ? 2.4 : 1.6,
          x: 0,
          y: 0,
          placed: false,
        }));
        for (let i = 0; i < LEVELS; i++) bufs[i] = new Float32Array(n * 3);
      }
    };

    // --- where we are between the two sections -----------------------------
    let raf = 0;
    let running = false;
    let idle = 0;

    const target = { x: 0, y: 0 };
    const edgeAt = { x: 0, y: 0 };
    const boxA: Box = { left: 0, top: 0, right: 0, bottom: 0 };
    const boxB: Box = { left: 0, top: 0, right: 0, bottom: 0 };

    /** The block's rect, held far enough inside the viewport to be seen. */
    const fit = (r: DOMRect, out: Box) => {
      out.left = Math.max(r.left, FRAME_INSET + FRAME_OUT);
      out.right = Math.min(r.right, vw - FRAME_INSET - FRAME_OUT);
      out.top = r.top;
      out.bottom = r.bottom;
      return out;
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);

      // Re-read every frame: both boxes move with the scroll, and either can
      // change height when the layout reflows or the language changes.
      from = from ?? framed(fromId);
      to = to ?? framed(toId);
      if (!from || !to) return;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();

      // Viewport centre against the two section centres, in viewport space —
      // no document offsets needed, so this is immune to anything above the
      // hero changing height.
      const aMid = a.top + a.height / 2;
      const bMid = b.top + b.height / 2;
      const span = bMid - aMid;
      const p = span <= 1 ? 1 : Math.min(1, Math.max(0, (vh / 2 - aMid) / span));

      // Out at the edges through the middle, home at either end.
      const edge = p < RAMP ? smooth(p / RAMP) : p > 1 - RAMP ? smooth((1 - p) / RAMP) : 1;

      // Below halfway the second section is the one worth framing, and by then
      // edge is 1, so the swap happens while nothing is near a frame anyway.
      const box = p < 0.5 ? fit(a, boxA) : fit(b, boxB);

      counts.fill(0);
      ctx.clearRect(0, 0, vw, vh);

      let drawn = 0;
      for (let i = 0; i < ps.length; i++) {
        const q = ps[i];
        onPerimeter(box, q.t, target);
        target.x += q.jx;
        target.y += q.jy;

        if (edge > 0.001) {
          edgeAt.x = (q.side < 0 ? EDGE_PAD : vw - EDGE_PAD) + q.jx * 0.6;
          // The band sweeps upward as p grows, so the stream travels with the
          // scroll instead of sitting still at the sides.
          edgeAt.y = vh * (q.lane * 1.6 - 0.3) + (0.5 - p) * vh * 1.3;
          target.x += (edgeAt.x - target.x) * edge;
          target.y += (edgeAt.y - target.y) * edge;
        }

        if (!q.placed) {
          q.x = target.x;
          q.y = target.y;
          q.placed = true;
        } else {
          q.x += (target.x - q.x) * EASE;
          q.y += (target.y - q.y) * EASE;
        }

        if (q.x < -40 || q.x > vw + 40 || q.y < -40 || q.y > vh + 40) continue;
        let lvl = ((q.a / 1) * LEVELS) | 0;
        if (lvl >= LEVELS) lvl = LEVELS - 1;
        const k = counts[lvl] * 3;
        bufs[lvl][k] = q.x;
        bufs[lvl][k + 1] = q.y;
        bufs[lvl][k + 2] = q.sz;
        counts[lvl]++;
        drawn++;
      }

      for (let l = 0; l < LEVELS; l++) {
        const n = counts[l];
        if (!n) continue;
        ctx.globalAlpha = ((l + 1) / LEVELS) * MAX_ALPHA;
        ctx.fillStyle = ink;
        const buf = bufs[l];
        for (let i = 0; i < n; i++) {
          const z = buf[i * 3 + 2];
          ctx.fillRect(buf[i * 3], buf[i * 3 + 1], z, z);
        }
      }
      ctx.globalAlpha = 1;

      // Nothing on screen and nothing approaching: give the frame back. The
      // scroll listener wakes it again, so there is no polling either.
      //
      // This asked for BOTH blocks to be in reach, which is never true once you
      // have arrived at the second one — the first is thousands of pixels above
      // by then. The loop shut down and cleared the canvas exactly where the
      // dust was supposed to be sitting. What matters is whether the viewport
      // is anywhere in the run: from a screen above the first to a screen below
      // the second.
      const near = a.top < vh * 2 && b.bottom > -vh;
      idle = drawn === 0 && !near ? idle + 1 : 0;
      if (idle > 30) stop();
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, vw, vh);
    };

    const start = () => {
      if (running) return;
      running = true;
      idle = 0;
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!document.hidden) start();
    };
    const onResize = () => {
      size();
      wake();
    };
    const onHide = () => {
      if (document.hidden) stop();
      else wake();
    };

    readInk();
    size();
    wake();

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onHide);
      themeWatch.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [fromId, toId]);

  return <canvas ref={canvasRef} className="section-dust" aria-hidden="true" />;
};

export default SectionDust;
