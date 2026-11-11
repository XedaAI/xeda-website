import type { ReactElement } from "react";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import type { Industry } from "../data";
import AccountingFx from "./AccountingFx";
import ManufacturingFx from "./ManufacturingFx";
import EcommerceFx from "./EcommerceFx";
import RealestateFx from "./RealestateFx";
import MedicalFx from "./MedicalFx";
import ConstructionFx from "./ConstructionFx";
import "./accounting.css";
import "./manufacturing.css";
import "./ecommerce.css";
import "./realestate.css";
import "./medical.css";
import "./construction.css";

// Each industry's hand-off from the scattered inputs to the organised result:
// a stylesheet (<industry>.css) and a set piece (<Industry>Fx.tsx), so that a
// first-time visitor sees the trade in how the work changes hands.
//
// Shared conventions
// - Scope every rule to its industry: .ix-stage[data-industry="<key>"] on
//   desktop, .ixw[data-industry="<key>"] on phones; prefix new classes with
//   hx-<key>-.
// - Desktop: data-run is set at the click (data-phase "processing"), the run
//   settles at RUN_MS.desktop (data-phase "after"). Phones: data-run is set
//   when the scan has finished (data-phase "after"); the hand-off plays from
//   there. Everything is timed from those moments.
// - The final state is always the ordinary result: rows fully visible and in
//   place, no leftover transforms, nothing covering text. With reduced motion
//   the set pieces are hidden and nothing moves (index.css).
// - The set piece renders in an aria-hidden slot: over the result panel on
//   desktop (.ix-fx, inside .ix-out-inner, may reach outside it), over the
//   window on phones (.ixw-fx, clipped to it). It never takes pointer events
//   or changes the layout.

export type FxProps = { variant: "desk" | "phone"; lang: SiteLanguage };

const FX: Record<Industry["key"], (props: FxProps) => ReactElement | null> = {
  accounting: AccountingFx,
  manufacturing: ManufacturingFx,
  ecommerce: EcommerceFx,
  realestate: RealestateFx,
  medical: MedicalFx,
  construction: ConstructionFx,
};

const HandoffFx = ({ industry, variant, lang }: { industry: Industry["key"] } & FxProps) => {
  const Fx = FX[industry];
  return <Fx variant={variant} lang={lang} />;
};

export default HandoffFx;
