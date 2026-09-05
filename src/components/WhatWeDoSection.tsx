import { Card, CardContent } from "@/components/ui/card";
import { Workflow, Zap, Bot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhatWeDoSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Workflow,
      titleKey: "whatWeDo.saas.title",
      descKey: "whatWeDo.saas.desc",
    },
    {
      icon: Zap,
      titleKey: "whatWeDo.mvp.title",
      descKey: "whatWeDo.mvp.desc",
    },
    {
      icon: Bot,
      titleKey: "whatWeDo.automation.title",
      descKey: "whatWeDo.automation.desc",
    },
  ];

  return (
    <section id="what-we-do" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">{t("whatWeDo.label")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("whatWeDo.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("whatWeDo.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {t(service.titleKey)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(service.descKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
