import type React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Factory, ShoppingCart, Building2, Stethoscope, HardHat, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Illustrative use cases — examples of what we build, NOT specific client data.
// Each card is the entry point to that industry's landing page (src/data/verticals.ts),
// so the six areas are a funnel rather than a static grid.
const cases = [
  { icon: Receipt, key: "accounting", slug: "steuerkanzleien" },
  { icon: Factory, key: "manufacturing", slug: "fertigung" },
  { icon: ShoppingCart, key: "ecommerce", slug: "e-commerce" },
  { icon: Building2, key: "realestate", slug: "immobilien" },
  { icon: Stethoscope, key: "medical", slug: "arztpraxis" },
  { icon: HardHat, key: "construction", slug: "handwerk" },
];

const UseCasesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="use-cases" className="py-28 md:py-36 section-ink">
      <div className="container mx-auto px-6">
        <div className="text-center mb-4">
          <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">{t("useCases.label")}</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.022em] text-foreground mb-5 text-balance">{t("useCases.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("useCases.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
          {cases.map(({ icon: Icon, key, slug }, index) => (
            <Link
              key={key}
              to={`/${slug}`}
              className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
            <Card
              className="card-lift enter h-full bg-card border-border/50 hover:shadow-lg group-hover:border-foreground/28"
              style={{ "--enter-delay": `${index * 0.07}s` } as React.CSSProperties}
            >
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{t(`useCases.${key}.industry`)}</h3>

                <p className="text-sm text-muted-foreground mb-3">
                  <span className="font-semibold text-foreground/70">Problem: </span>
                  {t(`useCases.${key}.problem`)}
                </p>
                <p className="text-sm text-foreground/80 mb-4">
                  <span className="font-semibold text-primary">{t("useCases.weBuild")}: </span>
                  {t(`useCases.${key}.build`)}
                </p>
                <p className="text-sm font-medium text-foreground border-t border-border pt-3">
                  → {t(`useCases.${key}.outcome`)}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t("useCases.learnMore")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
