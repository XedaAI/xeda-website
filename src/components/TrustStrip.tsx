import { ShieldCheck, Lock, Server, FileCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TrustStrip = () => {
  const { t } = useLanguage();

  const items = [
    { icon: ShieldCheck, titleKey: "trust.gdpr.title", descKey: "trust.gdpr.desc" },
    { icon: Lock, titleKey: "trust.encryption.title", descKey: "trust.encryption.desc" },
    { icon: Server, titleKey: "trust.deployment.title", descKey: "trust.deployment.desc" },
    { icon: FileCheck, titleKey: "trust.nda.title", descKey: "trust.nda.desc" },
  ];

  return (
    <section className="py-14 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm font-medium text-primary mb-10">
          {t("trust.label")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {items.map((item) => (
            <div key={item.titleKey} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t(item.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
