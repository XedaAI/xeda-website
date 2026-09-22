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
// the two blocks' centres, clamped to 0..1, so it is a position rather than an
// event: it cannot get out of step with the page, there is nothing to reset,
// and reversing direction reverses the motion for free.
//
//   p = 0      framed on the first block
//   0 < p < 1  out at the screen edges, sweeping upward as p grows
//   p = 1      framed on the second
//
// `edge` ramps in over the first and last sixth of that range, which is what
// makes it read as bursting outward and gathering back in rather than sliding
// along a diagonal. Every grain eases toward its target instead of being placed
// on it, so the bursting and the gathering both take a moment.
//
// Grains also answer to the cursor: pass through them and they are carried a
// little way along with it, then drift back. They pick up the pointer's motion
// rather than its position, so standing still does nothing and only a moving
// cursor disturbs them — and the pull is capped, so they are nudged rather than
// dragged off.

/** Ramp in and out over this much of the journey at each end. */
const RAMP = 0.16;
/** How far from the screen's sides the stream runs, CSS px. */
const EDGE_PAD = 26;
/** How far outside a block's box the frame sits, CSS px. */
const FRAME_OUT = 14;
/** The frame never goes closer than this to the screen's sides. Content blocks
    are often full-bleed, and an unclamped frame put its left and right runs off
    the screen entirely — three sides of a frame, and an asymmetric three at
    that, since a scrollbar makes the box off-centre. */
const FRAME_INSET = 16;
/** Per-frame follow toward the target. Lower is lazier. */
const EASE = 0.07;

/** How far the cursor reaches, CSS px. */
const PULL_REACH = 135;
/** Share of the pointer's own movement a grain takes on, at the centre. */
const PULL = 0.5;
/** Carried offsets bleed off at this rate, so they drift back on their own. */
const PULL_DECAY = 0.93;
/** Cap, CSS px. Nudged along, never dragged away. */
const PULL_MAX = 34;

/** Alpha steps per colour. Buckets keep fillStyle changes to colours x levels
    per frame instead of one per grain. */
const LEVELS = 4;
const MAX_ALPHA = 0.62;
/** Names of the CSS custom properties the palette is read from. */
const TINTS = ["--dust-1", "--dust-2", "--dust-3", "--dust-4", "--dust-5"];

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
  tint: number;
  x: number;
  y: number;
  /** Offset carried from the cursor, decaying back to nothing. */
  ox: number;
  oy: number;
  /** False until placed once, so it does not fly in from 0,0. */
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

    // The palette lives in CSS so it has a light and a dark set, and is read
    // only when the theme actually changes — reading computed style every frame
    // would force a style recalc every frame.
    let inks = TINTS.map(() => "#F8FAFC");
    const readInks = () => {
      const cs = getComputedStyle(canvas);
      inks = TINTS.map((v, i) => cs.getPropertyValue(v).trim() || inks[i]);
    };
    const themeWatch = new MutationObserver(readInks);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    let vw = 0;
    let vh = 0;
    let ps: P[] = [];
    const BUCKETS = TINTS.length * LEVELS;
    const bufs: Float32Array[] = [];
    const counts = new Int32Array(BUCKETS);

    const size = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = Math.round(Math.min(Math.max(vw / 3.2, 170), 400));
      if (ps.length !== n) {
        ps = Array.from({ length: n }, (_, i) => ({
          // Evenly spaced around the frame, jittered so it reads as dust
          // settled along an edge rather than as a dotted border.
          t: (i + Math.random() * 0.8) / n,
          side: i % 2 === 0 ? -1 : 1,
          lane: Math.random(),
          jx: (Math.random() - 0.5) * 22,
          jy: (Math.random() - 0.5) * 22,
          a: 0.32 + Math.random() * 0.68,
          sz: Math.random() < 0.2 ? 2.4 : 1.6,
          // Weighted toward the last tint, which is the foreground colour: the
          // site is monochrome, so colour is a minority of the dust rather
          // than the whole of it.
          tint: Math.random() < 0.45 ? TINTS.length - 1 : (Math.random() * (TINTS.length - 1)) | 0,
          x: 0,
          y: 0,
          ox: 0,
          oy: 0,
          placed: false,
        }));
        for (let i = 0; i < BUCKETS; i++) bufs[i] = new Float32Array(n * 3);
      }
    };

    // --- cursor -------------------------------------------------------------
    let cx = -9999;
    let cy = -9999;
    // Movement since the last frame, consumed and cleared by it.
    let dmx = 0;
    let dmy = 0;

    const onMove = (e: PointerEvent) => {
      if (cx > -9000) {
        dmx += e.clientX - cx;
        dmy += e.clientY - cy;
      }
      cx = e.clientX;
      cy = e.clientY;
      wake();
    };
    const onLeave = () => {
      cx = -9999;
      cy = -9999;
      dmx = 0;
      dmy = 0;
    };

    // --- loop ---------------------------------------------------------------
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

      from = from ?? framed(fromId);
      to = to ?? framed(toId);
      if (!from || !to) return;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();

      const aMid = a.top + a.height / 2;
      const bMid = b.top + b.height / 2;
      const span = bMid - aMid;
      const p = span <= 1 ? 1 : Math.min(1, Math.max(0, (vh / 2 - aMid) / span));

      const edge = p < RAMP ? smooth(p / RAMP) : p > 1 - RAMP ? smooth((1 - p) / RAMP) : 1;
      const box = p < 0.5 ? fit(a, boxA) : fit(b, boxB);

      // Taken once per frame, not once per pointermove: several moves can land
      // between two frames and they should add up to one push, not several.
      const mx = dmx;
      const my = dmy;
      dmx = 0;
      dmy = 0;
      const moved = mx !== 0 || my !== 0;
      const reach2 = PULL_REACH * PULL_REACH;

      counts.fill(0);
      ctx.clearRect(0, 0, vw, vh);

      let drawn = 0;
      let motion = 0;
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
          const stepX = (target.x - q.x) * EASE;
          const stepY = (target.y - q.y) * EASE;
          q.x += stepX;
          q.y += stepY;
          const m = Math.abs(stepX) + Math.abs(stepY);
          if (m > motion) motion = m;
        }

        // Carried along by a moving cursor, then let go.
        if (moved) {
          const dx = q.x - cx;
          const dy = q.y - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach2) {
            const w = 1 - d2 / reach2;
            q.ox += mx * PULL * w * w;
            q.oy += my * PULL * w * w;
          }
        }
        if (q.ox !== 0 || q.oy !== 0) {
          q.ox *= PULL_DECAY;
          q.oy *= PULL_DECAY;
          const om = Math.hypot(q.ox, q.oy);
          if (om > PULL_MAX) {
            q.ox *= PULL_MAX / om;
            q.oy *= PULL_MAX / om;
          }
          if (om < 0.05) {
            q.ox = 0;
            q.oy = 0;
          } else if (om > motion) motion = om;
        }

        const px = q.x + q.ox;
        const py = q.y + q.oy;
        if (px < -40 || px > vw + 40 || py < -40 || py > vh + 40) continue;
        let lvl = (q.a * LEVELS) | 0;
        if (lvl >= LEVELS) lvl = LEVELS - 1;
        const bucket = q.tint * LEVELS + lvl;
        const k = counts[bucket] * 3;
        bufs[bucket][k] = px;
        bufs[bucket][k + 1] = py;
        bufs[bucket][k + 2] = q.sz;
        counts[bucket]++;
        drawn++;
      }

      for (let bkt = 0; bkt < BUCKETS; bkt++) {
        const n = counts[bkt];
        if (!n) continue;
        ctx.globalAlpha = ((((bkt % LEVELS) + 1) / LEVELS) * MAX_ALPHA);
        ctx.fillStyle = inks[(bkt / LEVELS) | 0];
        const buf = bufs[bkt];
        for (let i = 0; i < n; i++) {
          const z = buf[i * 3 + 2];
          ctx.fillRect(buf[i * 3], buf[i * 3 + 1], z, z);
        }
      }
      ctx.globalAlpha = 1;

      // Give the frame back when there is nothing to see OR nothing is moving.
      // The second half matters: parked between the two sections, every grain
      // is already on its target and the loop would otherwise hold 60fps for
      // as long as you sit there. Scrolling and moving the pointer both wake it.
      const near = a.top < vh * 2 && b.bottom > -vh;
      idle = (drawn === 0 && !near) || (motion < 0.12 && !moved) ? idle + 1 : 0;
      if (idle > 40) stop();
    };

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function wake() {
      if (document.hidden || running) return;
      running = true;
      idle = 0;
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      size();
      wake();
    };
    const onHide = () => {
      if (document.hidden) stop();
      else wake();
    };

    readInks();
    size();
    wake();

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onHide);
      themeWatch.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [fromId, toId]);

  return <canvas ref={canvasRef} className="section-dust" aria-hidden="true" />;
};

export default SectionDust;
