import { useEffect, useRef } from "react";

/**
 * Subtle 3D tilt for cards. Attach the returned ref to a wrapper element: on
 * hover it tilts toward the cursor in perspective and lifts slightly, then eases
 * back on leave. Kept small (≤ ~6°) so it reads as depth, not a gimmick.
 * rAF-throttled and disabled for reduced-motion or touch (coarse) pointers,
 * where there is no meaningful cursor to follow.
 *
 * @param maxDeg maximum tilt in degrees at the card's edges.
 * @param lift   hover lift in px.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 6, lift = 4) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let rx = 0;
    let ry = 0;
    let hovering = false;
    el.style.transformStyle = "preserve-3d";
    el.style.willChange = "transform";

    const apply = () => {
      raf = 0;
      el.style.transform = hovering
        ? `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-${lift}px)`
        : "";
    };
    const onEnter = () => {
      // Short transition while tracking so the tilt stays smooth, not jittery.
      el.style.transition = "transform 0.12s ease-out";
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      ry = nx * maxDeg;
      rx = -ny * maxDeg;
      hovering = true;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      hovering = false;
      el.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
      if (!raf) raf = requestAnimationFrame(apply);
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [maxDeg, lift]);

  return ref;
}
