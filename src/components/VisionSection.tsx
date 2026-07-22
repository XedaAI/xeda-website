import { ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const steps = ["vision.step1", "vision.step2", "vision.step3", "vision.step4", "vision.step5", "vision.step6", "vision.step7"];
const whyPoints = ["vision.why1", "vision.why2", "vision.why3"];

const VisionSection = () => {
  const { t } = useLanguage();

  return (
    <section id="vision" className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-4 block">{t("vision.label")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("vision.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("vision.subtitle")}</p>
        </div>

        {/* Services -> SaaS path */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 mb-16">
          {steps.map((key, i) => (
            <div key={key} className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  i === 0
                    ? "bg-primary text-primary-foreground border-primary"
                    : i === steps.length - 1
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-card text-foreground/80 border-border"
                }`}
              >
                {t(key)}
              </span>
              {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>

        {/* Why Germany */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-border/50 bg-card/50 p-8">
          <h3 className="text-xl font-bold text-foreground mb-6 text-center">{t("vision.whyTitle")}</h3>
          <ul className="space-y-3">
            {whyPoints.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
