import { useEffect, useRef, type RefObject } from "react";

// The pipe's surface, as dust.
//
// Move the cursor over the pipe and the skin under it comes apart into grains
// that drift outward; move away and they settle back. Move FAST across it and
// the whole run loosens rather than just the patch under the cursor. Both the
// coming apart and the settling are deliberately slow — this is a surface
// dissolving, not an explosion.
//
// Two forces, kept separate because they answer to different things:
//
//   LOCAL   distance from the cursor. A patch about 160px across.
//   GLOBAL  cursor SPEED over the pipe, which loosens every grain at once.
//
// Each grain carries its own `s` in 0..1 and eases toward whichever is larger.
// It rises on one time constant and falls on a slower one, which is what makes
// the settling read as settling rather than as a snap back.
//
// The grains are only half of it: as they appear, the CSS pipe is masked away
// beneath them — a soft hole at the cursor, plus an overall fade driven by the
// global term. Without that the grains would read as specks ON the pipe rather
// than as the pipe itself coming apart. The bore keeps running underneath, so
// what the dissolve exposes is the data — which is the point of the whole hero.

/** Must match the clip-path trapezoid on .al-pipe in index.css. */
const TOP_NEAR = 0.077;
const TOP_FAR = 0.019;
const BOT_NEAR = 0.885;
const BOT_FAR = 0.635;

/** Room around the pipe for grains to drift into, CSS px. */
const PAD = 60;
/** Grid pitch. Smaller is denser and costlier; 9px lands near 800 grains. */
const PITCH = 9;
/** Radius of the cursor's influence, CSS px. */
const REACH = 160;
/** Speed, px/ms, at which the global term saturates. */
const FAST = 2.2;

/* Grains rise on one constant and fall on a slower one — that asymmetry is
   what makes the settling read as settling. The global term has its own pair:
   it is the driver, so it relaxes a little ahead of the grains and they trail
   it home. Measured at 60fps: the dust is visibly gone in about 2.5 seconds
   and the loop lets the frame go at about 3.7. An earlier pass fell at .006 and
   .01, which held the frame for seven and a half seconds after the cursor had
   left — past settling and into looking stuck. */
const RISE = 0.03;
const FALL = 0.014;
const AGIT_RISE = 0.05;
const AGIT_FALL = 0.025;
const SIZE = 1.6;
/** Alpha buckets. One fillStyle change per bucket instead of one per grain. */
const LEVELS = 6;
const MAX_ALPHA = 0.9;

interface Grain {
  /** Rest position in canvas CSS px. */
  rx: number;
  ry: number;
  /** Unit direction and distance it drifts to when fully loosened. */
  ux: number;
  uy: number;
  dist: number;
  /** Brightness at rest, taken from the pipe's own top-lit shading. */
  base: number;
  s: number;
}

interface PipeDustProps {
  /** The pipe element. Its box defines the surface and receives the mask. */
  pipeRef: RefObject<HTMLElement>;
}

const PipeDust = ({ pipeRef }: PipeDustProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const pipe = pipeRef.current;
    if (!canvas || !pipe) return;

    // A dissolving surface is decoration, and it needs a cursor to drive it.
    // Neither is true on a phone or for someone who asked for less motion.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let grains: Grain[] = [];
    let W = 0;
    let H = 0;
    let dpr = 1;

    // Preallocated per bucket, so a frame allocates nothing.
    const bufs: Float32Array[] = [];
    const counts = new Int32Array(LEVELS);

    const build = () => {
      const r = pipe.getBoundingClientRect();
      if (r.width < 40 || r.height < 20) return;
      W = r.width + PAD * 2;
      H = r.height + PAD * 2;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pw = r.width;
      const ph = r.height;
      const next: Grain[] = [];
      for (let x = 0; x <= pw; x += PITCH) {
        const u = x / pw;
        const top = ph * (TOP_NEAR + (TOP_FAR - TOP_NEAR) * u);
        const bot = ph * (BOT_NEAR + (BOT_FAR - BOT_NEAR) * u);
        for (let y = top; y <= bot; y += PITCH) {
          const v = (y - top) / (bot - top);
          // Jittered off the grid: a visible lattice would give the trick away.
          const jx = (Math.random() - 0.5) * PITCH * 0.9;
          const jy = (Math.random() - 0.5) * PITCH * 0.9;
          const ang = Math.random() * Math.PI * 2;
          next.push({
            rx: PAD + x + jx,
            ry: PAD + y + jy,
            ux: Math.cos(ang),
            uy: Math.sin(ang) * 0.75,
            dist: 14 + Math.random() * 34,
            // The skin runs lit at the top to near-black at the bottom; grains
            // lifted off it keep that, or the dust reads as a flat grey cloud.
            base: 0.16 + 0.74 * Math.pow(1 - v, 1.5),
            s: 0,
          });
        }
      }
      grains = next;
      const cap = grains.length * 2;
      for (let i = 0; i < LEVELS; i++) bufs[i] = new Float32Array(cap);
    };

    build();

    // --- loop state, declared before the handler that wakes it -------------
    let raf = 0;
    let running = false;
    let agit = 0;
    let hole = 0;

    // --- input -------------------------------------------------------------
    let cx = -9999;
    let cy = -9999;
    let speed = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let near = 0;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const t = e.timeStamp;
      if (lastT) {
        const dt = Math.max(t - lastT, 8);
        const d = Math.hypot(x - lastX, y - lastY);
        // Eased, or a single jumpy sample would spike the whole run.
        speed = speed * 0.7 + (d / dt) * 0.3;
      }
      lastX = x;
      lastY = y;
      lastT = t;
      cx = x;
      cy = y;

      const px = Math.max(PAD - x, x - (W - PAD), 0);
      const py = Math.max(PAD - y, y - (H - PAD), 0);
      near = Math.max(0, 1 - Math.hypot(px, py) / 150);
      if (near > 0 && visible && !running) start();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // A cursor that left the page sends no more moves, so nothing would ever
    // bring `near` back down and the loop would hold a frame forever.
    const onLeave = () => {
      near = 0;
      speed = 0;
      cx = -9999;
      cy = -9999;
    };
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    // Same for scrolling the hero out of view or switching tabs: there is
    // nothing to see, so there is no reason to keep simulating it.
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible) { onLeave(); stop(); }
    }, { threshold: 0 });
    io.observe(pipe);

    const onHide = () => { if (document.hidden) { onLeave(); stop(); } };
    document.addEventListener("visibilitychange", onHide);

    // --- loop --------------------------------------------------------------
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, W, H);
      pipe.classList.remove("is-dusting");
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);

      // A cursor that stopped is not a fast cursor.
      if (performance.now() - lastT > 90) speed *= 0.82;

      const agitTarget = Math.min(1, speed / FAST) * near;
      agit += (agitTarget - agit) * (agitTarget > agit ? AGIT_RISE : AGIT_FALL);
      const holeTarget = near > 0.6 ? 1 : 0;
      hole += (holeTarget - hole) * (holeTarget > hole ? RISE : FALL);

      pipe.style.setProperty("--burn-x", `${cx - PAD}px`);
      pipe.style.setProperty("--burn-y", `${cy - PAD}px`);
      pipe.style.setProperty("--burn-r", `${(REACH * hole).toFixed(1)}px`);
      pipe.style.setProperty("--burn-a", agit.toFixed(4));

      counts.fill(0);
      ctx.clearRect(0, 0, W, H);

      let peak = 0;
      const reach2 = REACH * REACH;
      for (let i = 0; i < grains.length; i++) {
        const g = grains[i];
        const ddx = g.rx - cx;
        const ddy = g.ry - cy;
        const q = (ddx * ddx + ddy * ddy) / reach2;
        // Smoothstep, so the patch has no visible rim.
        const local = q >= 1 ? 0 : (1 - q) * (1 - q);
        const target = Math.min(1, local + agit * 0.95);
        g.s += (target - g.s) * (target > g.s ? RISE : FALL);
        if (g.s > peak) peak = g.s;
        if (g.s < 0.02) continue;

        const a = g.base * g.s;
        if (a < 0.04) continue;
        let lvl = ((a / MAX_ALPHA) * LEVELS) | 0;
        if (lvl >= LEVELS) lvl = LEVELS - 1;
        const k = counts[lvl] * 2;
        bufs[lvl][k] = g.rx + g.ux * g.dist * g.s;
        bufs[lvl][k + 1] = g.ry + g.uy * g.dist * g.s;
        counts[lvl]++;
      }

      for (let l = 0; l < LEVELS; l++) {
        const n = counts[l];
        if (!n) continue;
        ctx.globalAlpha = ((l + 1) / LEVELS) * MAX_ALPHA;
        ctx.fillStyle = "#F3EFE8";
        const buf = bufs[l];
        for (let i = 0; i < n; i++) {
          ctx.fillRect(buf[i * 2], buf[i * 2 + 1], SIZE, SIZE);
        }
      }
      ctx.globalAlpha = 1;

      // Everything has settled and nothing is driving it: give the frame back.
      if (peak < 0.05 && agit < 0.01 && hole < 0.04 && near === 0) stop();
    };

    function start() {
      if (running) return;
      running = true;
      pipe.classList.add("is-dusting");
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      build();
      if (!running) ctx.clearRect(0, 0, W, H);
    });
    ro.observe(pipe);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onHide);
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      pipe.classList.remove("is-dusting");
      for (const v of ["--burn-x", "--burn-y", "--burn-r", "--burn-a"]) {
        pipe.style.removeProperty(v);
      }
    };
  }, [pipeRef]);

  return <canvas ref={canvasRef} className="al-dust" aria-hidden="true" />;
};

export default PipeDust;
