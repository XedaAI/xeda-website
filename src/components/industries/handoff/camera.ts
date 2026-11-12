// Short phone windows (a small screen, the browser's bars showing, a phone
// held sideways): the result needs more room than the window has and scrolls
// inside it, so part of a hand-off would play under the window's lower edge.
// A set piece can then move the result's scroll with the action, like a
// camera following the work:
//
//   const shots = [{ at: 1550, to: resultOverflow(result), ms: 240 }];
//   const stop = roll(result, shots);   // when data-run is set; stop() on cleanup
//
// Times are ms after data-run is set, the scroll targets are in px. The shots
// play on an animation clock started with the run, so they keep step with the
// CSS animations (and a test that pauses and seeks every animation sees the
// scroll of that moment too). Overlay parts in .ixw-fx sit outside the
// scroller: place them from layout positions minus scrollAt(shots, t) for the
// moment they land, not from the live scrollTop.
//
// The visitor always wins: once they scroll the result themselves during a
// run, MobileScene sets data-user-scroll on .ixw-view; the camera stops and
// the overlay is hidden (index.css), while the rows, which scroll with the
// result, play on. With reduced motion nothing rolls.

export type Shot = {
  /** When the glide starts, ms after data-run. */
  at: number;
  /** The result's scrollTop to glide to, px. */
  to: number;
  /** How long the glide takes, ms. */
  ms: number;
};

/** How far the result scrolls inside the window (0 when it fits), from layout
 *  positions: scrollHeight would count the rows' entrance offsets. */
export const resultOverflow = (result: HTMLElement) => {
  const last = result.lastElementChild as HTMLElement | null;
  if (!last) return 0;
  const need =
    last.offsetTop + last.offsetHeight + parseFloat(getComputedStyle(last).marginBottom) + parseFloat(getComputedStyle(result).paddingBottom);
  return Math.max(0, Math.round(need - result.clientHeight));
};

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

/** The result's scroll at `t` ms after data-run, under these shots (each
 *  glide starts from where the one before it ended; before the first, 0). */
export const scrollAt = (shots: Shot[], t: number) => {
  let y = 0;
  for (const s of [...shots].sort((a, b) => a.at - b.at)) {
    if (t <= s.at) break;
    const k = s.ms > 0 ? Math.min(1, (t - s.at) / s.ms) : 1;
    y += (s.to - y) * ease(k);
    if (k < 1) break;
  }
  return Math.round(y);
};

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Play the shots on the result from now (data-run); returns a stop function.
 *  Nothing moves with reduced motion, when there are no shots, or once the
 *  visitor has scrolled the result. */
export const roll = (result: HTMLElement, shots: Shot[]) => {
  const view = result.closest<HTMLElement>(".ixw-view");
  if (!shots.length || reduced() || typeof result.animate !== "function") return () => {};
  const end = Math.max(...shots.map((s) => s.at + s.ms));
  // The clock: an animation that changes nothing, so its current time follows
  // the page's animations (paused and sought along with them in tests).
  const clock = result.animate([{ offset: 0 }, { offset: 1 }], { duration: end + 50, fill: "forwards" });
  let raf = 0;
  const frame = () => {
    if (view?.hasAttribute("data-user-scroll")) return;
    const t = Number(clock.currentTime ?? 0);
    const y = scrollAt(shots, t);
    if (Math.abs(result.scrollTop - y) >= 1) result.scrollTop = y;
    if (clock.playState !== "finished") raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    clock.cancel();
  };
};
