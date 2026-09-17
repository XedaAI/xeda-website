import type React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Our point of view — what we claim, as opposed to who we serve (UseCases) or
// who we are (WhyUs). Each claim is a position with something on the other side
// of it, and each is drawn from how we already work rather than invented for the
// page: the data-before-model rule and the last two are the gates from /process,
// and the second restates why we build into existing tools instead of a portal.
//
// Deliberately NOT another icon-card grid — the page already has three. A
// numbered, left-aligned list reads as a statement of position, which is the
// point.
const CLAIM_COUNT = 5;

const ClaimsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="claims" className="py-28 md:py-36 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-14">
            <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">
              {t("claims.label")}
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.022em] text-foreground mb-5 text-balance">
              {t("claims.title")}
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">{t("claims.subtitle")}</p>
          </div>

          <ol className="flex flex-col">
            {Array.from({ length: CLAIM_COUNT }, (_, i) => i + 1).map((n, index) => (
              <li
                key={n}
                className="enter flex gap-5 sm:gap-8 border-t border-border py-8 last:border-b"
                style={{ "--enter-delay": `${index * 0.06}s` } as React.CSSProperties}
              >
                <span className="font-mono text-sm text-brand-accent pt-1.5 tabular-nums shrink-0">
                  {String(n).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-xl md:text-2xl font-semibold tracking-[-0.018em] text-foreground leading-snug text-balance mb-3">
                    {t(`claims.${n}.claim`)}
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-pretty">
                    {t(`claims.${n}.support`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ClaimsSection;
