import { useEffect, useRef } from "react";

/**
 * Subtle scroll parallax. Attach the returned ref to an element that should drift
 * slower than the page as the user scrolls. GPU-accelerated (translate3d),
 * requestAnimationFrame-throttled, and disabled when the user prefers reduced motion.
 *
 * @param speed 0 = no movement, 1 = moves with the page. Keep it low (0.2–0.4) for taste.
 */
export function useParallax<T extends HTMLElement>(speed = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Drift upward more slowly than the page for a gentle depth effect.
      el.style.transform = `translate3d(0, ${-window.scrollY * speed}px, 0)`;
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
  }, [speed]);

  return ref;
}
