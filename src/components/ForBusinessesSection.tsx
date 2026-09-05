import { Card, CardContent } from "@/components/ui/card";
import { Building2, Bot, Users, Workflow } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ForBusinessesSection = () => {
  const { t } = useLanguage();

  const offerings = [
    {
      icon: Workflow,
      titleKey: "forBusinesses.transformation.title",
      descKey: "forBusinesses.transformation.desc",
    },
    {
      icon: Bot,
      titleKey: "forBusinesses.copilots.title",
      descKey: "forBusinesses.copilots.desc",
    },
    {
      icon: Building2,
      titleKey: "forBusinesses.automation.title",
      descKey: "forBusinesses.automation.desc",
    },
    {
      icon: Users,
      titleKey: "forBusinesses.enablement.title",
      descKey: "forBusinesses.enablement.desc",
    },
  ];

  return (
    <section id="for-businesses" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">{t("forBusinesses.label")}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t("forBusinesses.title")}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t("forBusinesses.subtitle")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("forBusinesses.description")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {offerings.map((offering, index) => (
              <Card key={index} className="border-border/50 bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <offering.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t(offering.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(offering.descKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBusinessesSection;
