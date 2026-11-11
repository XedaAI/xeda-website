// Medical triage: the result's requests arrive jumbled and sort themselves
// into priority order (CSS: "Industry hand-offs" in index.css).

/** The order the requests arrive in (row indices, top to bottom) before
 *  they sort themselves into priority order. */
const TRIAGE_ORDER = [2, 0, 3, 1];

/** Give each result row its starting offset in the jumbled order (--from-px),
 *  measured, since the rows differ in height. CSS falls back to whole-row
 *  steps (--from) without it. */
export const placeTriage = (root: HTMLElement, selector: string) => {
  const rows = [...root.querySelectorAll<HTMLElement>(selector)];
  if (rows.length !== TRIAGE_ORDER.length) return;
  const tops = rows.map((r) => r.offsetTop);
  let y = Math.min(...tops);
  TRIAGE_ORDER.forEach((i) => {
    rows[i].style.setProperty("--from-px", `${Math.round(y - tops[i])}px`);
    y += rows[i].offsetHeight;
  });
};
