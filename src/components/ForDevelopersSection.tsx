import { Button } from "@/components/ui/button";
import { Code2, GitBranch, Handshake, Terminal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ForDevelopersSection = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: GitBranch,
      textKey: "forDevelopers.benefit1",
    },
    {
      icon: Terminal,
      textKey: "forDevelopers.benefit2",
    },
    {
      icon: Handshake,
      textKey: "forDevelopers.benefit3",
    },
    {
      icon: Code2,
      textKey: "forDevelopers.benefit4",
    },
  ];

  return (
    <section id="for-developers" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-sm font-medium text-primary mb-4 block">{t("forDevelopers.label")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t("forDevelopers.title")}
          </h2>
          <p className="text-muted-foreground mb-12 leading-relaxed">
            {t("forDevelopers.subtitle")}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-12 text-left">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground text-sm leading-relaxed pt-2">
                  {t(benefit.textKey)}
                </p>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            variant="outline"
            asChild
            className="px-8"
          >
            <a href="mailto:contact@xeda.ai?subject=Developer%20collaboration">
              {t("forDevelopers.cta")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForDevelopersSection;
