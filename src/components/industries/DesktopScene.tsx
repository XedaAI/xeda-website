import type React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, Check, FileCheck2, RotateCcw } from "lucide-react";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import { tx, type Industry } from "./data";
import { InputCard } from "./primitives";
import { OutputView } from "./Outputs";
import { Environment } from "./Environments";
import StageHead from "./StageHead";
import XedaNode, { type Phase } from "./XedaNode";
import { delay } from "./timing";

// The desktop scene (lg and up): inputs, Xeda and the result side by side,
// joined by data paths measured from the laid-out elements. Phones get
// MobileScene instead — a different composition, not this one squeezed.

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

const DesktopScene = ({
  industry, phase, fading, lang, t, onRun, onReset, onReplay,
}: {
  industry: Industry;
  phase: Phase;
  fading: boolean;
  lang: SiteLanguage;
  t: (key: string) => string;
  onRun: () => void;
  onReset: () => void;
  onReplay: () => void;
}) => {
  const [paths, setPaths] = useState<Paths>({ inb: [], outb: [] });
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLButtonElement>(null);

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
  }, [industry.key, lang, remeasure]);

  const run = () => {
    const stage = stageRef.current;
    const node = nodeRef.current;
    if (!stage || !node) return;
    // Point every input at the node so it travels into it.
    const n = node.getBoundingClientRect();
    const cx = n.left + n.width / 2;
    const cy = n.top + n.height / 2;
    stage.querySelectorAll<HTMLElement>("[data-ix-input]").forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--dx", `${cx - (r.left + r.width / 2)}px`);
      el.style.setProperty("--dy", `${cy - (r.top + r.height / 2)}px`);
    });
    onRun();
  };
  const onNode = () => (phase === "before" ? run() : phase === "after" ? onReset() : undefined);
  const hint = phase === "before" ? t("useCases.clickHint") : phase === "processing" ? t("useCases.working") : t("useCases.mOrganised");

  return (
    <div
      id="ix-stage"
      role="tabpanel"
      aria-labelledby={`ix-tab-${industry.key}`}
      ref={stageRef}
      className="ix-stage ix-scene"
      data-phase={phase}
      data-run={phase !== "before" ? "" : undefined}
      data-fading={fading ? "" : undefined}
      data-industry={industry.key}
    >
      {/* Where the work happens: this industry's environment, behind it all. */}
      <Environment industry={industry.key} className="ix-envx" />

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

      {/* 1 · Before: the scattered inputs. */}
      <div className="ix-in">
        <StageHead n={1} title={t("useCases.stage1")} sub={t("useCases.stage1Sub")} />
        <div className="ix-items">
          {industry.inputs.map((item, i) => <InputCard key={`${industry.key}-${i}`} item={item} i={i} lang={lang} />)}
          {/* Once read, the inputs are listed tidily in their place. */}
          <ul className="ix-sources" aria-hidden="true">
            <li className="ix-sources-head" style={delay(1500)}>{t("useCases.read")}</li>
            {industry.sources.map((s, i) => (
              <li key={i} className="ix-src" style={delay(1560 + i * 90)}>
                <FileCheck2 className="h-3.5 w-3.5 text-success" />
                <span className="truncate">{tx(s, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2 · Xeda: the node, what to do with it, and what it reads. */}
      <div className="ix-core">
        <StageHead n={2} title={t("useCases.stage2")} sub={t("useCases.stage2Sub")} center />
        <div className="ix-core-body">
        <XedaNode
          phase={phase}
          fields={industry.fields}
          lang={lang}
          label={phase === "after" ? `${t("useCases.mOrganised")} — ${t("useCases.reset")}` : t("useCases.activate")}
          onActivate={onNode}
          nodeRef={nodeRef}
        />
        <p className="ix-hint" aria-live="polite">
          {phase === "after" && <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.8} />}
          {hint}
        </p>
        <div className="ix-actions">
          {phase === "after" ? (
            <>
              <button type="button" className="ix-action ix-action--quiet" onClick={onReplay}>
                <RotateCcw className="h-3.5 w-3.5" />
                {t("useCases.replay")}
              </button>
              <button type="button" className="ix-link-btn" onClick={onReset}>{t("useCases.reset")}</button>
            </>
          ) : (
            <button type="button" className="ix-action" onClick={onNode} aria-disabled={phase === "processing"}>
              {phase === "processing" ? t("useCases.processing") : t("useCases.activate")}
              {phase === "before" && <ArrowRight className="h-4 w-4" />}
            </button>
          )}
        </div>
        </div>
      </div>

      {/* 3 · After: a dimmed preview until Xeda has made it. */}
      <div className="ix-out">
        <StageHead n={3} title={t("useCases.stage3")} sub={t("useCases.stage3Sub")} />
        <ul className="ix-chips" aria-hidden="true">
          {industry.chips.map((c, i) => (
            <li key={i} style={delay(1850 + i * 90)}>
              <Check className="h-3 w-3" strokeWidth={3} />
              {tx(c, lang)}
            </li>
          ))}
        </ul>
        <div className="ix-out-inner">
          <OutputView output={industry.output} lang={lang} />
          <p className="ix-waiting" aria-hidden={phase !== "before"}>{t("useCases.waiting")}</p>
        </div>
      </div>
    </div>
  );
};

export default DesktopScene;
