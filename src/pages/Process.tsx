import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import PhaseIllustration from "@/components/PhaseIllustration";
import { useLanguage } from "@/contexts/LanguageContext";
import { auditBookingUrl } from "@/lib/booking";
import { PROCESS } from "@/data/process";

// The delivery method in full — the detail beneath the homepage's four-step
// XEDA summary. Content lives in src/data/process.ts (bilingual) rather than in
// LanguageContext: it is ~70 strings used by this page alone, and keeping them
// together makes the method readable and editable as one document.
const Process = () => {
  const { language, t } = useLanguage();
  const c = PROCESS[language === "de" ? "de" : "en"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead customTitle={c.seoTitle} customDescription={c.seoDescription} />

      <div className="container mx-auto px-6 pt-12">
        <Link to="/">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("blogPage.backHome")}
          </Button>
        </Link>
      </div>

      <main>
        {/* Intro */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">
              {c.eyebrow}
            </span>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.022em] text-foreground mb-6 text-balance">
              {c.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">{c.intro}</p>
          </div>
        </section>

        {/* The four letters — the same summary as the homepage, as a map of what follows */}
        <section className="pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {c.stages.map(({ letter, icon: Icon, title }) => (
                <div
                  key={letter}
                  className="flex flex-col items-center text-center gap-3 rounded-xl border border-border/60 bg-card p-5"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {letter}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The seven phases */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="space-y-6">
              {c.phases.map((p) => (
                <Card key={p.n} className="card-lift bg-card border-border/50">
                  <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8">
                    {/* The drawing carries the phase at a glance; on a phone it sits
                        above the text rather than squeezing it. */}
                    <PhaseIllustration
                      n={p.n}
                      className="w-[104px] h-[104px] sm:w-[124px] sm:h-[124px] shrink-0 text-foreground/90"
                    />

                    <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center flex-none">
                        {p.n}
                      </span>
                      <h2 className="text-xl font-semibold text-foreground">{p.title}</h2>
                      <span
                        className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                          p.withClient
                            ? "border-highlight/60 bg-highlight-soft text-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {p.withClient ? <Users className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {p.withClient ? c.withClientLabel : c.internalLabel}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/80 mb-5">
                      <span className="font-semibold text-foreground">{c.objectiveLabel}: </span>
                      {p.objective}
                    </p>

                    <ul className="space-y-2.5 mb-6">
                      {p.steps.map((s) => (
                        <li key={s} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-pretty">{s}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-border pt-4 space-y-2">
                      <p className="text-sm text-foreground/80">
                        <span className="font-semibold text-foreground">{c.deliverableLabel}: </span>
                        {p.deliverable}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground/70">{c.gateLabel} </span>
                        {p.gate}
                      </p>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* The gates, stated as commitments */}
        <section className="py-20 md:py-28 section-ink">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-[-0.022em] text-foreground mb-4 text-balance">
              {c.rulesTitle}
            </h2>
            <p className="text-muted-foreground mb-10">{c.rulesIntro}</p>
            <ul className="space-y-4">
              {c.rules.map((r, i) => (
                <li key={r} className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full border border-primary/40 text-primary text-xs font-bold flex items-center justify-center flex-none mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90 text-pretty">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-[-0.022em] text-foreground mb-4 text-balance">
              {c.ctaTitle}
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">{c.ctaBody}</p>
            <Button asChild size="lg" className="px-8">
              <a href={auditBookingUrl("process")} target="_blank" rel="noopener noreferrer">
                {c.ctaButton}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Process;
