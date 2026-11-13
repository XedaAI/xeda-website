import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { industries } from "./data";

// The six industry tabs. On a phone the row is wider than the screen, so it
// has to say so: it runs to the screen edges with the next pill peeking in,
// fades at whichever end has more, shows an arrow there, keeps the chosen
// pill centred, and a count underneath ("3 / 6") says how many there are.

const IndustrySelector = ({
  active, onSelect, t, reducedMotion,
}: {
  active: number;
  onSelect: (i: number) => void;
  t: (key: string) => string;
  reducedMotion: boolean;
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [more, setMore] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setMore({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  // Keep the chosen industry in the middle of the row, never half-hidden at
  // the edge. Scrolls the row only — the page itself does not move.
  useEffect(() => {
    const el = railRef.current;
    const tab = tabRefs.current[active];
    if (!el || !tab || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: tab.offsetLeft - (el.clientWidth - tab.offsetWidth) / 2, behavior: reducedMotion ? "auto" : "smooth" });
  }, [active, reducedMotion]);

  const page = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = industries.length - 1;
    const next = e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    tabRefs.current[next]?.focus();
    onSelect(next);
  };

  return (
    <div className="ixs" data-more-left={more.left ? "" : undefined} data-more-right={more.right ? "" : undefined}>
      <div className="ixs-frame">
        <div ref={railRef} role="tablist" aria-label={t("useCases.industries")} className="ix-tabs" onScroll={update}>
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            const selected = i === active;
            return (
              <button
                key={ind.key}
                ref={(el) => { tabRefs.current[i] = el; }}
                role="tab"
                id={`ix-tab-${ind.key}`}
                aria-selected={selected}
                aria-controls="ix-stage"
                tabIndex={selected ? 0 : -1}
                onClick={() => onSelect(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`ix-tab ${selected ? "is-active" : ""}`}
              >
                <Icon className="h-4 w-4" />
                {t(`useCases.${ind.key}.industry`)}
              </button>
            );
          })}
        </div>
        {/* Visible cues that the row goes on; the pills themselves stay the
            keyboard route, so these are skipped by Tab. */}
        <button type="button" tabIndex={-1} className="ixs-arrow ixs-arrow--left" onClick={() => page(-1)} aria-label={t("useCases.moreLeft")}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" tabIndex={-1} className="ixs-arrow ixs-arrow--right" onClick={() => page(1)} aria-label={t("useCases.moreRight")}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="ixs-count" aria-hidden="true">
        <span className="ixs-dots">
          {industries.map((ind, i) => <span key={ind.key} className={i === active ? "is-active" : ""} />)}
        </span>
        <span className="font-mono tabular-nums">{active + 1} / {industries.length}</span>
      </div>
    </div>
  );
};

export default IndustrySelector;
