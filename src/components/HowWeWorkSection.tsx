import { Search, Code, BarChart3, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowWeWorkSection = () => {
  const { t } = useLanguage();

  // The badge carries the acronym letter rather than a plain step number: the
  // four steps spell XEDA, so the letter encodes both the sequence and the name.
  const steps = [
    {
      icon: Search,
      letter: "X",
      titleKey: "howWeWork.step1.title",
      descKey: "howWeWork.step1.desc",
    },
    {
      icon: BarChart3,
      letter: "E",
      titleKey: "howWeWork.step2.title",
      descKey: "howWeWork.step2.desc",
    },
    {
      icon: Code,
      letter: "D",
      titleKey: "howWeWork.step3.title",
      descKey: "howWeWork.step3.desc",
    },
    {
      icon: Zap,
      letter: "A",
      titleKey: "howWeWork.step4.title",
      descKey: "howWeWork.step4.desc",
    },
  ];

  return (
    <section id="how-we-work" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">{t("howWeWork.label")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("howWeWork.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("howWeWork.subtitle")}
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
          
          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.letter}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowWeWorkSection;
