import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileCheck2, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { industries, tx } from "@/components/industries/data";
import { InputCard } from "@/components/industries/primitives";
import { delay } from "@/components/industries/timing";
import { OutputView } from "@/components/industries/Outputs";
import { Backdrop } from "@/components/industries/Backdrops";
import XedaNode, { type Phase } from "@/components/industries/XedaNode";

// Industries, as one repeated demonstration: messy work on the left, Xeda in
// the middle, structured action on the right. Nothing runs on its own — the
// visitor presses Xeda and watches the inputs travel in and the result build
// up, then can put it back and try another industry. Switching industry fades
// to the new scene in its "before" state.
//
// Timing (ms from the click): inputs travel in 0–1300, the fields light
// 420–1100, rows fill from 1150, statuses land a beat after each row, and the
// run is complete at RUN_MS. The same numbers drive the CSS delays.

const RUN_MS = 2450;
const FADE_MS = 200;

type Paths = { inb: string[]; outb: string[] };

/** Curves from every input into the node and from the node to each output
 *  row, measured from the laid-out scene so they meet the real elements —
 *  sideways on desktop, top-to-bottom on a phone. */
const measurePaths = (stage: HTMLElement): Paths => {
  const base = stage.getBoundingClientRect();
  const node = stage.querySelector<HTMLElement>(".ix-node")?.getBoundingClientRect();
  const panel = stage.querySelector<HTMLElement>(".ix-panel")?.getBoundingClientRect();
  if (!node || !panel) return { inb: [], outb: [] };
  const rel = (x: number, y: number) => [x - base.left, y - base.top];
  const [nx, ny] = rel(node.left + node.width / 2, node.top + node.height / 2);
  const inputs = [...stage.querySelectorAll<HTMLElement>("[data-ix-input]")].map((el) => el.getBoundingClientRect());
  const sideways = inputs.length > 0 && node.left > Math.max(...inputs.map((r) => r.left));
  const curve = (sx: number, sy: number, ex: number, ey: number) =>
    sideways
      ? `M${sx} ${sy} C${(sx + ex) / 2} ${sy} ${(sx + ex) / 2} ${ey} ${ex} ${ey}`
      : `M${sx} ${sy} C${sx} ${(sy + ey) / 2} ${ex} ${(sy + ey) / 2} ${ex} ${ey}`;

  const inb = inputs.map((r, i) => {
    const spread = (i - (inputs.length - 1) / 2) * 5;
    if (sideways) {
      const [sx, sy] = rel(r.right - 6, r.top + r.height / 2);
      return curve(sx, sy, nx - node.width / 2 - 2, ny + spread);
    }
    const [sx, sy] = rel(r.left + r.width / 2, r.bottom - 6);
    return curve(sx, sy, nx + spread, ny - node.height / 2 - 2);
  });

  let outb: string[];
  if (sideways) {
    // One curve per distinct row height in the result.
    const ys = [...new Set(
      [...stage.querySelectorAll<HTMLElement>(".ix-panel .ix-row")]
        .map((el) => { const r = el.getBoundingClientRect(); return Math.round((r.top + r.height / 2) / 10) * 10; }),
    )].slice(0, 5);
    outb = ys.map((y, i) => {
      const [ex, ey] = rel(panel.left + 1, y);
      return curve(nx + node.width / 2 + 2, ny + (i - (ys.length - 1) / 2) * 5, ex, ey);
    });
  } else {
    outb = [0.2, 0.4, 0.6, 0.8].map((f, i) => {
      const [ex, ey] = rel(panel.left + panel.width * f, panel.top + 1);
      return curve(nx + (i - 1.5) * 5, ny + node.height / 2 + 2, ex, ey);
    });
  }
  return { inb, outb };
};

const UseCasesSection = () => {
  const { t, language: lang } = useLanguage();
  const [active, setActive] = useState(0); // selected tab
  const [shown, setShown] = useState(0); // scene on stage (lags during the fade)
  const [phase, setPhase] = useState<Phase>("before");
  const [fading, setFading] = useState(false);
  const [paths, setPaths] = useState<Paths>({ inb: [], outb: [] });
  const [reducedMotion, setReducedMotion] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);
  const clearTimers = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };
  useEffect(() => clearTimers, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Re-measure the data paths whenever the scene or the layout changes. Only
  // in the "before" state: that is when the inputs are where the paths start.
  const remeasure = useCallback(() => {
    const stage = stageRef.current;
    if (stage && stage.dataset.phase === "before") setPaths(measurePaths(stage));
  }, []);
  useLayoutEffect(() => {
    remeasure();
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(remeasure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [shown, lang, remeasure]);

  const industry = industries[shown];

  const select = (i: number) => {
    if (i === active) return;
    clearTimers();
    setActive(i);
    setFading(true);
    timers.current.push(window.setTimeout(() => {
      setShown(i);
      setPhase("before");
      setFading(false);
    }, reducedMotion ? 0 : FADE_MS));
  };

  const run = () => {
    const stage = stageRef.current;
    const node = nodeRef.current;
    if (!stage || !node || phase !== "before") return;
    // Point every input at the node so it travels into it.
    const n = node.getBoundingClientRect();
    const cx = n.left + n.width / 2;
    const cy = n.top + n.height / 2;
    stage.querySelectorAll<HTMLElement>("[data-ix-input]").forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--dx", `${cx - (r.left + r.width / 2)}px`);
      el.style.setProperty("--dy", `${cy - (r.top + r.height / 2)}px`);
    });
    if (reducedMotion) { setPhase("after"); return; }
    setPhase("processing");
    timers.current.push(window.setTimeout(() => setPhase("after"), RUN_MS));
  };

  const reset = () => { clearTimers(); setPhase("before"); };
  const onNode = () => (phase === "before" ? run() : phase === "after" ? reset() : undefined);

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const last = industries.length - 1;
    const next = e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    tabRefs.current[next]?.focus();
    select(next);
  };

  const actionLabel = phase === "before" ? t("useCases.activate") : phase === "processing" ? t("useCases.processing") : t("useCases.reset");

  return (
    <section id="use-cases" className="py-28 md:py-36 section-ink">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">{t("useCases.label")}</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.022em] text-foreground mb-5 text-balance">{t("useCases.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("useCases.intro")}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Industry selector: one scene at a time. Scrolls sideways on a phone. */}
          <div role="tablist" aria-label={t("useCases.industries")} className="ix-tabs">
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
                  onClick={() => select(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`ix-tab ${selected ? "is-active" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {t(`useCases.${ind.key}.industry`)}
                </button>
              );
            })}
          </div>

          <div
            id="ix-stage"
            role="tabpanel"
            aria-labelledby={`ix-tab-${industries[active].key}`}
            ref={stageRef}
            className="ix-stage ix-scene"
            data-phase={phase}
            data-run={phase !== "before" ? "" : undefined}
            data-fading={fading ? "" : undefined}
            data-industry={industry.key}
          >
            <svg className="ix-paths" aria-hidden="true">
              {paths.inb.map((d, i) => (
                <g key={`i${i}`}>
                  <path d={d} className="ix-path ix-path--in" />
                  <path d={d} pathLength={100} className="ix-pulse" style={delay(i * 65)} />
                </g>
              ))}
              {paths.outb.map((d, i) => (
                <g key={`o${i}`}>
                  <path d={d} className="ix-path ix-path--out" />
                  <path d={d} pathLength={100} className="ix-pulse ix-pulse--out" style={delay(980 + i * 120)} />
                </g>
              ))}
            </svg>

            {/* Before: the scattered inputs, over the industry's scenery. */}
            <div className="ix-in">
              <span className="ix-zone-label">{t("useCases.before")}</span>
              <Backdrop industry={industry.key} />
              <div className="ix-items">
                {industry.inputs.map((item, i) => <InputCard key={`${industry.key}-${i}`} item={item} i={i} lang={lang} />)}
                {/* Once read, the inputs are listed tidily in their place. */}
                <ul className="ix-sources" aria-hidden="true">
                  <li className="ix-sources-head" style={delay(1500)}>{t("useCases.read")}</li>
                  {industry.sources.map((s, i) => (
                    <li key={i} className="ix-src" style={delay(1560 + i * 90)}>
                      <FileCheck2 className="h-3.5 w-3.5 text-brand-accent" />
                      <span className="truncate">{tx(s, lang)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Xeda. */}
            <div className="ix-core">
              <XedaNode
                phase={phase}
                fields={industry.fields}
                lang={lang}
                label={`Xeda — ${actionLabel}`}
                onActivate={onNode}
                nodeRef={nodeRef}
              />
              <button type="button" className="ix-action" onClick={onNode} aria-disabled={phase === "processing"}>
                {phase === "after" && <RotateCcw className="h-3.5 w-3.5" />}
                {actionLabel}
                {phase === "before" && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* After: the structured result. */}
            <div className="ix-out">
              <span className="ix-zone-label ix-zone-label--after">{t("useCases.after")}</span>
              <div className="ix-out-inner">
                <OutputView output={industry.output} lang={lang} />
              </div>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">{phase === "after" ? tx(industry.summary, lang) : ""}</p>

          {/* The industry in words, under the demonstration. All six are laid
              in one grid cell so the tallest sets the height and switching
              never moves the page; only the shown one is visible. */}
          <div className="ix-copy-stack" data-fading={fading ? "" : undefined}>
            {industries.map((ind, i) => (
              <div key={ind.key} className={`ix-copy ${i === shown ? "is-shown" : ""}`} aria-hidden={i !== shown}>
                <div>
                  <span className="ix-copy-label">{t("useCases.problem")}</span>
                  <p>{t(`useCases.${ind.key}.problem`)}</p>
                </div>
                <div>
                  <span className="ix-copy-label text-primary">{t("useCases.weBuild")}</span>
                  <p>{t(`useCases.${ind.key}.build`)}</p>
                </div>
                <div>
                  <span className="ix-copy-label text-brand-accent">{t("useCases.outcome")}</span>
                  <p className="text-foreground">{t(`useCases.${ind.key}.outcome`)}</p>
                </div>
                <Link
                  to={`/${ind.slug}`}
                  tabIndex={i === shown ? undefined : -1}
                  className="group inline-flex items-center gap-1.5 self-end whitespace-nowrap text-sm font-medium text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("useCases.learnMore")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
