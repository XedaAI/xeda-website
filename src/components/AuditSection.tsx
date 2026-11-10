import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Compass } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { auditBookingUrl } from "@/lib/booking";

const AuditSection = () => {
  const { t } = useLanguage();

  const points = ["audit.point1", "audit.point2", "audit.point3", "audit.point4"];

  return (
    <section id="audit" className="drift-host py-28 md:py-36 section-ink">
      {/* Soft light behind the section, drifting slowest of all: the far
          layer of the page's parallax. */}
      <div aria-hidden="true" className="drift-glow drift-glow--a" data-drift="0.22" data-drift-max="140" />
      <div aria-hidden="true" className="drift-glow drift-glow--b" data-drift="0.18" data-drift-max="120" />
      <div className="container mx-auto px-6">
        {/* data-dust-frame: the card is the visual block, not the section. */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-primary/20 bg-primary/5 p-8 md:p-12" data-dust-frame>
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Compass className="w-7 h-7 text-primary" />
            </div>

            <div className="flex-1">
              <span className="text-sm font-semibold tracking-wide text-brand-accent mb-3 block">
                {t("audit.label")}
              </span>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.022em] text-foreground mb-5 text-balance" data-drift="0.06" data-drift-max="40">
                {t("audit.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("audit.subtitle")}
              </p>

              <ul className="grid sm:grid-cols-2 gap-4 mb-10">
                {points.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">{t(key)}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" asChild className="px-8 max-w-full h-auto min-h-11 py-2.5 whitespace-normal text-center sm:whitespace-nowrap">
                <a href={auditBookingUrl("audit-section")} target="_blank" rel="noopener noreferrer">
                  {t("audit.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuditSection;
