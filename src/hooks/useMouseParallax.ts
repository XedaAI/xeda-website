import { useEffect, useRef } from "react";

/**
 * Cursor-driven parallax. Attach the returned ref to an element that should drift
 * toward/away from the mouse for a subtle sense of depth. GPU-accelerated,
 * requestAnimationFrame-throttled, and disabled for reduced-motion or touch (coarse)
 * pointers where there is no meaningful cursor.
 *
 * @param strength maximum drift in px at the screen edges. Keep it small (8–20).
 */
export function useMouseParallax<T extends HTMLElement>(strength = 14) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    const apply = () => {
      raf = 0;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };
    const onMove = (e: MouseEvent) => {
      // Normalised -1..1 offset from viewport centre.
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      tx = nx * strength;
      ty = ny * strength;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return ref;
}
