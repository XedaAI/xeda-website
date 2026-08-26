import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { auditBookingUrl } from "@/lib/booking";

const PricingSection = () => {
  const { t } = useLanguage();

  const packages = [
    {
      nameKey: "pricing.starter.name",
      descKey: "pricing.starter.desc",
      priceKey: "pricing.starter.price",
      periodKey: "pricing.starter.period",
      features: [
        "pricing.starter.feature1",
        "pricing.starter.feature2",
        "pricing.starter.feature3",
        "pricing.starter.feature4",
        "pricing.starter.feature5",
      ],
      highlighted: false,
    },
    {
      nameKey: "pricing.growth.name",
      descKey: "pricing.growth.desc",
      priceKey: "pricing.growth.price",
      periodKey: "pricing.growth.period",
      features: [
        "pricing.growth.feature1",
        "pricing.growth.feature2",
        "pricing.growth.feature3",
        "pricing.growth.feature4",
        "pricing.growth.feature5",
        "pricing.growth.feature6",
      ],
      highlighted: true,
    },
    {
      nameKey: "pricing.enterprise.name",
      descKey: "pricing.enterprise.desc",
      priceKey: "pricing.enterprise.price",
      periodKey: "pricing.enterprise.period",
      features: [
        "pricing.enterprise.feature1",
        "pricing.enterprise.feature2",
        "pricing.enterprise.feature3",
        "pricing.enterprise.feature4",
        "pricing.enterprise.feature5",
        "pricing.enterprise.feature6",
        "pricing.enterprise.feature7",
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <Card
              key={index}
              className={`relative ${
                pkg.highlighted
                  ? "border-primary shadow-lg scale-105"
                  : "bg-card/50"
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                    {t("pricing.popular")}
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-foreground">
                  {t(pkg.nameKey)}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(pkg.descKey)}
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    {t(pkg.priceKey)}
                  </span>
                  <p className="text-sm text-muted-foreground">{t(pkg.periodKey)}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((featureKey, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {t(featureKey)}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="w-full"
                  variant={pkg.highlighted ? "default" : "outline"}
                >
                  <a href={auditBookingUrl("pricing")} target="_blank" rel="noopener noreferrer">
                    {t("pricing.cta")}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12">
          {t("pricing.note")}
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
