import type React from "react";
import { Check } from "lucide-react";
import XedaMark from "@/components/XedaMark";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import { tx, type Field, type Industry } from "./data";
import { NodeSignature } from "./Signature";
import { delay } from "./timing";

export type Phase = "before" | "processing" | "after";

/** When field i lights up during a run, in ms from the click. */
const fieldAt = (i: number) => 420 + i * 170;

// The centre of the scene: the XEDA orbit mark in a processing module. Idle it
// is dim, with a slow halo inviting the click; running, an orange edge sweeps
// round it, the mark lifts and the industry's own instrument works beneath
// it (Signature.tsx) while the fields it reads light up one by one; done, it
// settles with a check and the instrument at rest.
const XedaNode = ({
  industry, phase, fields, lang, label, onActivate, nodeRef,
}: {
  industry: Industry["key"];
  phase: Phase;
  fields: Field[];
  lang: SiteLanguage;
  label: string;
  onActivate: () => void;
  nodeRef: React.Ref<HTMLButtonElement>;
}) => (
  <>
    <button
      ref={nodeRef}
      type="button"
      className="ix-node"
      onClick={onActivate}
      // aria-disabled rather than disabled while it runs, so keyboard focus
      // stays on the node instead of dropping to the page.
      aria-disabled={phase === "processing"}
      aria-label={label}
    >
      <span className="ix-node-ring" aria-hidden="true" />
      {/* This industry's own instrument, working under the mark. */}
      <NodeSignature industry={industry} lang={lang} />
      <XedaMark className="ix-node-mark" />
      <span className="ix-node-done" aria-hidden="true"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
    </button>
    <ul className="ix-fields" aria-hidden="true">
      {fields.map((f, i) => (
        <li key={i} className={`ix-field ${f.flag ? "ix-field--flag" : ""}`} style={delay(fieldAt(i))}>
          <span className="ix-field-dot" />
          {tx(f.label, lang)}
        </li>
      ))}
    </ul>
  </>
);

export default XedaNode;
