import { Shield, Zap, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyUsSection = () => {
  const { t } = useLanguage();

  const reasons = [
    {
      icon: Shield,
      titleKey: "whyUs.reason1.title",
      descKey: "whyUs.reason1.desc",
    },
    {
      icon: Zap,
      titleKey: "whyUs.reason2.title",
      descKey: "whyUs.reason2.desc",
    },
    {
      icon: Brain,
      titleKey: "whyUs.reason3.title",
      descKey: "whyUs.reason3.desc",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary mb-4 block">{t("whyUs.label")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("whyUs.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("whyUs.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <reason.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {t(reason.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(reason.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
