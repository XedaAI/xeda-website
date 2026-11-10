import { useEffect, type RefObject } from "react";

// Parallax: an element drifts against the scroll in proportion to how far it
// is from the middle of the screen, so layers at different speeds give the
// page depth as you scroll through it.
//
// One shared scroll loop for every element on the page (a single rAF per
// frame, reading positions first and writing after), and it writes the CSS
// `translate` property, not `transform`, so it composes with any transform or
// animation the element already has instead of overwriting it. Phones get a
// gentler drift. Nothing moves for visitors who ask for reduced motion.

type Entry = { el: HTMLElement; speed: number; phoneSpeed: number; max: number; y: number };

const entries = new Set<Entry>();
let frame = 0;
let listening = false;

const phone = () => window.matchMedia("(max-width: 1023px)").matches;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const update = () => {
  frame = 0;
  const vh = window.innerHeight;
  const small = phone();
  // Read every position first, then write, so the browser lays out once.
  const moves: [Entry, number][] = [];
  entries.forEach((e) => {
    const r = e.el.getBoundingClientRect();
    // Where it would be without its own drift, so the drift does not feed back.
    const top = r.top - e.y;
    if (r.bottom - e.y < -vh || top > vh * 2) return; // far off screen
    const offset = top + r.height / 2 - vh / 2;
    const y = Math.max(-e.max, Math.min(e.max, -offset * (small ? e.phoneSpeed : e.speed)));
    moves.push([e, y]);
  });
  moves.forEach(([e, y]) => { e.y = y; e.el.style.translate = `0 ${y.toFixed(1)}px`; });
};

const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };

const start = () => {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
};
const stop = () => {
  if (!listening || entries.size) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
};

/**
 * Make `ref` drift while scrolling. `speed` is the share of its distance from
 * the screen's middle it moves against the scroll (0.1 = slow, decorative);
 * `phoneSpeed` defaults to half of it; `max` caps the drift in pixels.
 */
export function useScrollDrift(
  ref: RefObject<HTMLElement | null>,
  { speed = 0.08, phoneSpeed, max = 80 }: { speed?: number; phoneSpeed?: number; max?: number } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    return registerDrift(el, speed, phoneSpeed ?? speed / 2, max);
  }, [ref, speed, phoneSpeed, max]);
}

/** Register an element directly; returns the function that unregisters it. */
export function registerDrift(el: HTMLElement, speed: number, phoneSpeed = speed / 2, max = 80) {
  const entry: Entry = { el, speed, phoneSpeed, max, y: 0 };
  entries.add(entry);
  start();
  schedule();
  return () => {
    entries.delete(entry);
    el.style.translate = "";
    stop();
  };
}

/**
 * Every element on the page marked `data-drift="<speed>"` drifts at that
 * speed (optional `data-drift-max`, px). Lets a page give its section
 * headings and decorations depth without wrapping them in extra elements.
 */
export function useDriftAttributes() {
  useEffect(() => {
    if (reduced()) return;
    const offs = [...document.querySelectorAll<HTMLElement>("[data-drift]")].map((el) => {
      const speed = Number(el.dataset.drift) || 0.05;
      const max = Number(el.dataset.driftMax) || 60;
      return registerDrift(el, speed, speed / 2, max);
    });
    return () => offs.forEach((off) => off());
  }, []);
}
