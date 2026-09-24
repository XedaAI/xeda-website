import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import TiltWrapper from "@/components/TiltWrapper";
import accountingArt from "@/assets/use-cases/accounting.webp";
import manufacturingArt from "@/assets/use-cases/manufacturing.webp";
import ecommerceArt from "@/assets/use-cases/ecommerce.webp";
import realestateArt from "@/assets/use-cases/realestate.webp";
import medicalArt from "@/assets/use-cases/medical.webp";
import constructionArt from "@/assets/use-cases/construction.webp";

// Illustrative use cases — examples of what we build, NOT specific client data.
// Each card is the entry point to that industry's landing page (src/data/verticals.ts),
// so the six areas are a funnel rather than a static grid.
// `core` is where the picture's glowing AI cube sits, as a share of its width
// and height: the pulse is laid over exactly that spot.
const cases = [
  { art: accountingArt, core: ["46.8%", "61%"], key: "accounting", slug: "steuerkanzleien" },
  { art: manufacturingArt, core: ["39.8%", "64%"], key: "manufacturing", slug: "fertigung" },
  { art: ecommerceArt, core: ["39.4%", "64.6%"], key: "ecommerce", slug: "e-commerce" },
  { art: realestateArt, core: ["49.2%", "55.7%"], key: "realestate", slug: "immobilien" },
  { art: medicalArt, core: ["43.6%", "60.9%"], key: "medical", slug: "arztpraxis" },
  { art: constructionArt, core: ["40.5%", "75.3%"], key: "construction", slug: "handwerk" },
];

/** Phones: the cards fold down to picture + title, and open on tap. */
const useIsPhone = () => {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return phone;
};

const UseCasesSection = () => {
  const { t } = useLanguage();
  const isPhone = useIsPhone();
  // Each card opens and closes on its own rather than as an accordion: closing
  // one card above the one being tapped would shift it out from under the
  // finger. The first starts open so the pattern explains itself.
  const [open, setOpen] = useState<Record<string, boolean>>({ [cases[0].key]: true });

  return (
    <section id="use-cases" className="py-28 md:py-36 section-ink">
      <div className="container mx-auto px-6">
        <div className="text-center mb-4">
          <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">{t("useCases.label")}</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.022em] text-foreground mb-5 text-balance">{t("useCases.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("useCases.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
          {cases.map(({ art, core, key, slug }, index) => {
            const expanded = !isPhone || !!open[key];
            const panelId = `use-case-${key}`;
            return (
            <TiltWrapper key={key}>
            <Card
              className="uc-card group card-lift enter relative h-full overflow-hidden bg-card border-border/50 hover:shadow-lg hover:border-foreground/28 focus-within:border-foreground/28"
              data-open={expanded}
              style={{ "--enter-delay": `${index * 0.07}s`, "--uc-delay": `${index * -2.3}s` } as React.CSSProperties}
            >
              {/* Picture and title: on phones the whole area is the toggle. */}
              <div className="relative">
                <div
                  className="uc-media"
                  style={{ "--core-x": core[0], "--core-y": core[1] } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <img src={art} alt="" loading="lazy" decoding="async" className="uc-art" />
                  <span className="uc-core" />
                  <span className="uc-sheen" />
                </div>
                <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
                  <h3 className="text-lg font-bold text-foreground">{t(`useCases.${key}.industry`)}</h3>
                  <ChevronDown
                    aria-hidden="true"
                    className={`md:hidden mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                  />
                </div>
                <button
                  type="button"
                  className="md:hidden absolute inset-0 w-full rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                >
                  <span className="sr-only">{t(`useCases.${key}.industry`)}</span>
                </button>
              </div>

              <div id={panelId} className={`uc-fold ${expanded ? "is-open" : ""}`}>
                {/* Closed folds are inert so their link is not tabbed into
                    unseen. */}
                <div className="uc-fold-inner" {...(!expanded ? { inert: "" } : {})}>
                  <CardContent className="px-6 pb-6 pt-0 flex flex-col">
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

                    {/* From tablet up the link stretches over the whole card,
                        so the card stays one click target as before. */}
                    <Link
                      to={`/${slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary focus-visible:outline-none focus-visible:underline md:after:absolute md:after:inset-0 md:after:content-['']"
                    >
                      {t("useCases.learnMore")}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </div>
              </div>
            </Card>
            </TiltWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
