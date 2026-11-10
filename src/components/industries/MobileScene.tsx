import type React from "react";
import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardList, FileText, Mail, MessageCircle, MessageSquare, PhoneIncoming, Pill, RotateCcw } from "lucide-react";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import { industries, tx, type Industry, type MobileInput } from "./data";
import { HouseArt, SitePhotoArt } from "./primitives";
import { MobileOutput } from "./MobileOutputs";
import { industryImages } from "./images";
import Parallax from "@/components/Parallax";
import type { Phase } from "./XedaNode";
import { RUN_MS } from "./timing";

// The phone scene: one window, one stage at a time.
//
//   ┌ 1 Before Xeda ················ [ Activate Xeda → ] ┐   red, pulsing
//   │                          tap to watch Xeda ↗        │   points at it
//   │   messy inputs, askew, over the industry's picture  │
//   │   ─────────── scan line ───────────                 │   on activate
//   │   [Vendor] [Date] [Amount] …  what Xeda reads       │
//   └─────────────────────────────────────────────────────┘
//
// Pressing the button sends a scan line down the window: each input lights up
// as it passes and the fields Xeda reads light up with it. When the scan is
// done the inputs drop away and the organised result builds up, row by row,
// in the same window. Nothing runs by itself: the button pulses and the hint
// points at it until it is pressed.

const TILT = [
  { r: "-1.4deg", x: "0px" },
  { r: "1.1deg", x: "12px" },
  { r: "-0.7deg", x: "4px" },
];

/** The scan takes all but the last moment of the run. */
const SCAN_MS = RUN_MS.phone - 150;

const InputIcon = ({ item }: { item: MobileInput }) => {
  switch (item.kind) {
    case "pdf": return <span className="ixm-in-icon ixm-in-icon--pdf">PDF</span>;
    case "mail": return <span className="ixm-in-icon"><Mail className="h-4 w-4" /></span>;
    case "chat": return <span className="ixm-in-icon"><MessageSquare className="h-4 w-4" /></span>;
    case "call": return <span className="ixm-in-icon"><PhoneIncoming className="h-4 w-4" /></span>;
    case "rx": return <span className="ixm-in-icon"><Pill className="h-4 w-4" /></span>;
    case "site": return <span className="ixm-in-icon ixm-in-icon--site"><MessageCircle className="h-4 w-4" /></span>;
    case "bits": return <span className="ixm-in-icon"><ClipboardList className="h-4 w-4" /></span>;
    case "photo": return <span className="ixm-in-icon ixm-in-icon--art"><SitePhotoArt /></span>;
    case "listing": return <span className="ixm-in-icon ixm-in-icon--art"><HouseArt /></span>;
    default: return <span className="ixm-in-icon"><FileText className="h-4 w-4" /></span>;
  }
};

const fill = (s: string, n: number) => s.replace("{n}", String(n));
const ms = (v: number) => ({ "--t": Math.round(v) }) as React.CSSProperties;

const MobileScene = ({
  industry, index, phase, fading, lang, t, onActivate, onReset, onReplay, onSelect,
}: {
  industry: Industry;
  index: number;
  phase: Phase;
  fading: boolean;
  lang: SiteLanguage;
  t: (key: string) => string;
  onActivate: () => void;
  onReset: () => void;
  onReplay: () => void;
  onSelect: (i: number) => void;
}) => {
  const n = industry.mobileInputs.length;
  const prev = (index + industries.length - 1) % industries.length;
  const next = (index + 1) % industries.length;
  const done = phase === "after";
  const scanning = phase === "processing";

  // "Activate Xeda" unmounts when the result appears. If it had focus, focus
  // would fall back to <body>, so hand it to "Replay", which takes its place.
  const ctaRef = useRef<HTMLButtonElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const ctaHadFocus = useRef(false);
  useEffect(() => {
    if (phase !== "after" || !ctaHadFocus.current) return;
    ctaHadFocus.current = false;
    const active = document.activeElement;
    if (!active || active === document.body) replayRef.current?.focus({ preventScroll: true });
  }, [phase]);
  const activate = () => {
    ctaHadFocus.current = document.activeElement === ctaRef.current;
    onActivate();
  };

  const flagged = industry.fields.filter((f) => f.flag).length;
  const summary = fill(t("useCases.mFieldsRead"), industry.fields.length) + (flagged ? ` · ${fill(t("useCases.mFlagged"), flagged)}` : "");

  // What the bar says, per stage.
  const stage = done
    ? { n: 3, title: t("useCases.stage3"), sub: t("useCases.stage3Sub") }
    : scanning
      ? { n: 2, title: t("useCases.mScanning"), sub: t("useCases.working") }
      : { n: 1, title: t("useCases.stage1"), sub: t("useCases.stage1Sub") };

  return (
    <div
      id="ix-stage"
      role="tabpanel"
      aria-labelledby={`ix-tab-${industry.key}`}
      className="ixm ixw ix-scene"
      data-phase={phase}
      // The result's own animations key off data-run; here it is set when
      // the scan is done, so the rows build up after the scan, not under it.
      data-run={done ? "" : undefined}
      data-fading={fading ? "" : undefined}
      data-industry={industry.key}
    >
      {/* The window's bar: which stage, and the one thing to press. The
          title is short so the row never wraps; the description gets the
          full width under it. Both keep their height in every stage, so the
          window does not jump. */}
      <p className="sr-only" aria-live="polite">{stage.title}. {stage.sub}</p>
      <div className="ixw-bar">
        <p className="ixw-stage" aria-hidden="true">
          <span className="ixw-step" data-n={stage.n}>{done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : stage.n}</span>
          <span className="ixw-stage-title">{stage.title}</span>
        </p>
        {done ? (
          <button ref={replayRef} type="button" className="ixw-replay" onClick={onReplay}>
            <RotateCcw className="h-4 w-4" />
            {t("useCases.replay")}
          </button>
        ) : (
          <button
            ref={ctaRef}
            type="button"
            className="ixw-go"
            onClick={phase === "before" ? activate : undefined}
            aria-disabled={scanning}
          >
            {scanning ? t("useCases.mBusy") : t("useCases.activate")}
            {!scanning && <ArrowRight className="h-4 w-4" />}
          </button>
        )}
      </div>
      <p className="ixw-stage-sub" aria-hidden="true">{stage.sub}</p>

      {/* Until it is pressed: a pointer to it. */}
      <p className="ixw-hint" aria-hidden={phase !== "before"}>
        <span>{t("useCases.mTapHint")}</span>
        <svg viewBox="0 0 28 28" className="ixw-hint-arrow" aria-hidden="true">
          <path d="M4 24 C 10 22, 18 16, 22 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M15.5 8.5 L 22 5 L 24 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </p>

      {/* The window itself: the scattered inputs and the organised result share
          one frame, so it keeps its height from one stage to the next. */}
      <div className="ixw-view">
        <Parallax className="ixm-bg" speed={0} phoneSpeed={0.06} max={22}>
          <img key={industry.key} src={industryImages[industry.key]} alt="" loading="lazy" decoding="async" />
        </Parallax>

        <ul className="ixw-layer ixw-inputs ixm-inputs" {...(done ? { inert: "" } : {})}>
          {industry.mobileInputs.map((item, i) => (
            <li
              key={`${industry.key}-${i}`}
              className="ixm-in"
              style={{
                "--i": i,
                "--r": TILT[i % TILT.length].r,
                "--x": TILT[i % TILT.length].x,
                // when the scan line reaches this input
                "--t": Math.round(((i + 0.55) / n) * SCAN_MS * 0.82),
              } as React.CSSProperties}
            >
              <InputIcon item={item} />
              <span className="min-w-0 flex-1">
                <span className="ixm-in-title">{tx(item.title, lang)}</span>
                {item.meta && <span className="ixm-in-meta">{tx(item.meta, lang)}</span>}
                {item.bits && (
                  <span className="ixm-bits">
                    {item.bits.map((b, j) => <span key={j}>{tx(b, lang)}</span>)}
                  </span>
                )}
              </span>
              {item.unresolved && <span className="ixm-unresolved" aria-label={lang === "de" ? "ungeklärt" : "unresolved"}>?</span>}
              <span className="ixw-read" aria-hidden="true"><Check className="h-3 w-3" strokeWidth={3} /></span>
            </li>
          ))}
        </ul>

        <div className="ixw-layer ixw-result" {...(!done ? { inert: "" } : {})}>
          <p className="ixw-done-line">
            <Check className="h-4 w-4 text-success" strokeWidth={2.8} />
            <strong>{t("useCases.mOrganised")}</strong>
            <span className="text-muted-foreground"> · {summary}</span>
          </p>
          <MobileOutput output={industry.output} lang={lang} />
          {/* Inside the frame, so the window does not grow when it appears. */}
          <p className="ixw-after">
            <button type="button" className="ixm-again ixm-again--quiet" onClick={onReset}>{t("useCases.reset")}</button>
          </p>
        </div>

        {/* The scan line. */}
        <span className="ixw-beam" aria-hidden="true" style={{ "--scan": `${SCAN_MS}ms` } as React.CSSProperties} />
      </div>

      {/* What Xeda reads, lighting up as the scan finds it. */}
      <ul className="ixw-fields" aria-label={t("useCases.mReads")}>
        {industry.fields.map((f, i) => (
          <li
            key={i}
            className={`ix-field ${f.flag ? "ix-field--flag" : ""}`}
            style={ms(((i + 1) / (industry.fields.length + 1)) * SCAN_MS)}
          >
            <span className="ix-field-dot" />
            {tx(f.label, lang)}
          </li>
        ))}
      </ul>

      {industry.caveat && <p className="ix-caveat ixm-caveat">{tx(industry.caveat, lang)}</p>}

      {/* The other five, one tap away. */}
      <nav className="ixm-nav" aria-label={t("useCases.industries")}>
        <button type="button" onClick={() => onSelect(prev)}>
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="ixm-nav-name">{t(`useCases.${industries[prev].key}.industry`)}</span>
        </button>
        <span className="ixm-nav-count" aria-hidden="true">{index + 1} / {industries.length}</span>
        <button type="button" onClick={() => onSelect(next)}>
          <span className="ixm-nav-name">{t(`useCases.${industries[next].key}.industry`)}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </nav>
    </div>
  );
};

export default MobileScene;
