import type React from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardList, FileText, Mail, MessageCircle, MessageSquare, PhoneIncoming, Pill, RotateCcw } from "lucide-react";
import XedaMark from "@/components/XedaMark";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import { industries, tx, type Industry, type MobileInput } from "./data";
import { HouseArt, SitePhotoArt } from "./primitives";
import { MobileOutput } from "./MobileOutputs";
import { Environment } from "./Environments";
import StageHead from "./StageHead";
import type { Phase } from "./XedaNode";
import { delay } from "./timing";

// The phone scene, designed for a phone rather than squeezed from desktop:
//
//   BEFORE XEDA      two or three inputs, stacked a little askew
//        ↓
//   [ Xeda ]         a wide module with the mark: "Organise with Xeda"
//   fields           what it reads, wrapping, lighting up as it works
//        ↓
//   AFTER XEDA       the result, which takes no room until it exists
//   ‹ prev   3/6   next ›
//
// Pressing Xeda sends the inputs down into it, lights the fields, folds the
// inputs away into a one-line "read" note and opens the result underneath,
// so the card grows to fit what it shows instead of reserving both states.
// The whole run is about 1.3 s.

const TILT = [
  { r: "-1.4deg", x: "0px" },
  { r: "1.1deg", x: "12px" },
  { r: "-0.7deg", x: "4px" },
];

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

  const flagged = industry.fields.filter((f) => f.flag).length;
  const summary = fill(t("useCases.mFieldsRead"), industry.fields.length) + (flagged ? ` · ${fill(t("useCases.mFlagged"), flagged)}` : "");

  return (
    <div
      id="ix-stage"
      role="tabpanel"
      aria-labelledby={`ix-tab-${industry.key}`}
      className="ixm ix-scene"
      data-phase={phase}
      data-run={phase !== "before" ? "" : undefined}
      data-fading={fading ? "" : undefined}
      data-industry={industry.key}
    >
      {/* The industry's environment, as a strip across the top of the card. */}
      <Environment industry={industry.key} className="ixm-strip" />

      {/* 1 · Before */}
      <StageHead
        n={1}
        title={t("useCases.stage1")}
        sub={done ? <span className="text-success">{fill(t("useCases.mInputsRead"), n)}</span> : t("useCases.stage1Sub")}
      />
      <div className="ixm-fold ixm-fold--before">
        <div className="ixm-fold-inner" {...(done ? { inert: "" } : {})}>
          <ul className="ixm-inputs">
            {industry.mobileInputs.map((item, i) => (
              <li
                key={`${industry.key}-${i}`}
                className="ixm-in"
                style={{ "--i": i, "--r": TILT[i % TILT.length].r, "--x": TILT[i % TILT.length].x } as React.CSSProperties}
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
              </li>
            ))}
          </ul>
        </div>
      </div>

      <span className="ixm-link" aria-hidden="true"><span /></span>

      {/* 2 · Xeda: the mark and what it reads, then the action itself. */}
      <StageHead n={2} title={t("useCases.stage2")} sub={t("useCases.stage2Sub")} />
      <div className="ixm-module">
        <div className="ixm-module-top">
          <span className="ixm-tile" aria-hidden="true">
            <span className="ix-node-ring" />
            <XedaMark className="ixm-mark" />
            <span className="ix-node-scan" />
            <span className="ix-node-done"><Check className="h-3 w-3" strokeWidth={3} /></span>
          </span>
          <ul className="ixm-fields" aria-label={t("useCases.mReads")}>
            {industry.fields.map((f, i) => (
              <li key={i} className={`ix-field ${f.flag ? "ix-field--flag" : ""}`} style={delay(160 + i * 80)}>
                <span className="ix-field-dot" />
                {tx(f.label, lang)}
              </li>
            ))}
          </ul>
        </div>
        {done ? (
          <div className="ixm-done">
            <p className="ixm-done-line">
              <Check className="h-4 w-4 text-success" strokeWidth={2.8} />
              <strong>{t("useCases.mOrganised")}</strong>
              <span className="sr-only"> · {summary}</span>
            </p>
            <div className="ixm-done-actions">
              <button type="button" className="ixm-again" onClick={onReplay}>
                <RotateCcw className="h-3.5 w-3.5" />
                {t("useCases.replay")}
              </button>
              <button type="button" className="ixm-again ixm-again--quiet" onClick={onReset}>{t("useCases.reset")}</button>
            </div>
          </div>
        ) : (
          <>
            <button type="button" className="ixm-cta" onClick={phase === "before" ? onActivate : undefined} aria-disabled={phase === "processing"}>
              {phase === "processing" ? t("useCases.processing") : t("useCases.activate")}
              {phase === "before" && <ArrowRight className="h-4 w-4" />}
            </button>
            <p className="ixm-helper">{phase === "processing" ? t("useCases.working") : t("useCases.tapHint")}</p>
          </>
        )}
      </div>

      <span className="ixm-link ixm-link--out" aria-hidden="true"><span /></span>

      {/* 3 · After: a one-line promise until Xeda makes it, then the result. */}
      <StageHead n={3} title={t("useCases.stage3")} sub={done || phase === "processing" ? t("useCases.stage3Sub") : t("useCases.teaser")} />
      <div className="ixm-fold ixm-fold--after">
        <div className="ixm-fold-inner" {...(!done ? { inert: "" } : {})}>
          <ul className="ix-chips ixm-chips" aria-hidden="true">
            {industry.chips.map((c, i) => (
              <li key={i} style={delay(900 + i * 70)}>
                <Check className="h-3 w-3" strokeWidth={3} />
                {tx(c, lang)}
              </li>
            ))}
          </ul>
          <MobileOutput output={industry.output} lang={lang} />
        </div>
      </div>

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
