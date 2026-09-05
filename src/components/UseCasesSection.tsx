import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Factory, ShoppingCart, Building2, Stethoscope, HardHat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Illustrative use cases — examples of what we build, NOT specific client data.
const cases = [
  { icon: Receipt, key: "accounting" },
  { icon: Factory, key: "manufacturing" },
  { icon: ShoppingCart, key: "ecommerce" },
  { icon: Building2, key: "realestate" },
  { icon: Stethoscope, key: "medical" },
  { icon: HardHat, key: "construction" },
];

const UseCasesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="use-cases" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-4">
          <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">{t("useCases.label")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("useCases.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("useCases.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
          {cases.map(({ icon: Icon, key }) => (
            <Card key={key} className="bg-card border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
