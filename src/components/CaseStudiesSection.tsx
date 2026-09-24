import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CalendarClock, PhoneCall, CalendarCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { auditBookingUrl } from "@/lib/booking";
import TiltWrapper from "@/components/TiltWrapper";

// Proof, not a product catalogue. These are real products we built and operate,
// and on a site with no client logos or testimonials yet they are the only
// evidence that we ship. So they are deliberately compact: name and what it
// does, nothing more. The feature lists, stack tags ("Next.js, Stripe, Docker")
// and category badges ("Vertical SaaS") were removed — they read as "we sell
// products" and speak to developers, not to the person buying the work.
//
// Replace this with a real client case study once one exists; the products can
// then retire to a single line.
const products = [
  { icon: CalendarClock, name: "FahrPlan", key: "fahrplan" },
  { icon: PhoneCall, name: "Handwerker Rezeption", key: "rezeption" },
  { icon: CalendarCheck, name: "OmniBook", key: "omnibook" },
];

const CaseStudiesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="case-studies" className="py-28 md:py-36 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">
            {t("caseStudies.label")}
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.022em] text-foreground mb-5 text-balance">
            {t("caseStudies.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("caseStudies.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {products.map(({ icon: Icon, name, key }, index) => (
            <TiltWrapper key={key}>
            <Card
              className="card-lift enter h-full bg-card border-border/50"
              style={{ "--enter-delay": `${index * 0.07}s` } as React.CSSProperties}
            >
              <CardContent className="p-6 text-center">
                <div className="w-11 h-11 rounded-xl icon-tile flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">{name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {t(`caseStudies.${key}.tagline`)}
                </p>
              </CardContent>
            </Card>
            </TiltWrapper>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href={auditBookingUrl("case-studies")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            {t("caseStudies.cta")}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
