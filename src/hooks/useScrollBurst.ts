import { useEffect, useRef } from "react";

/**
 * Drives a `--burst` CSS variable (0 → 1) from scroll position: 0 while at the top
 * of the page, ramping to 1 as the user scrolls one viewport down. Children read it
 * (e.g. transform: translate(calc(var(--tx) * var(--burst)))) to scrub a
 * burst-apart / reassemble effect to the scrollbar. rAF-throttled; for reduced-motion
 * it pins to 0 (always assembled).
 */
export function useScrollBurst<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--burst", "0");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const distance = window.innerHeight || 800;
      const progress = Math.min(1, Math.max(0, window.scrollY / distance));
      el.style.setProperty("--burst", progress.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
