import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  FileText,
  Sparkles,
  Search,
  Wrench,
  RefreshCw,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { auditBookingUrl } from "@/lib/booking";
import type { Vertical } from "@/data/verticals";

// Single template for every standalone outbound-campaign landing page.
// Content per vertical lives in src/data/verticals.ts; the process steps and
// trust row below are shared because they are identical across all verticals.
// Deliberately single-language (German) and standalone — these are conversion
// pages for specific outbound campaigns, not part of the multilingual main site.

const steps = [
  {
    icon: Search,
    title: "1. Audit",
    desc: "In 30 Minuten zeigen wir, wo bei Ihnen Zeit und Geld steckt — mit Zahlen. Kostenlos, ohne Verpflichtung.",
  },
  {
    icon: Wrench,
    title: "2. Build",
    desc: "Wir bauen die Lösung bis zur Produktion, integriert in Ihre bestehenden Tools — in Wochen, nicht Monaten.",
  },
  {
    icon: RefreshCw,
    title: "3. Betrieb",
    desc: "Auf Wunsch hosten und betreiben wir alles für Sie — Sie kümmern sich um Ihr Kerngeschäft.",
  },
];

const trust = [
  { icon: ShieldCheck, label: "DSGVO-konform" },
  { icon: FileText, label: "EU- / On-Premise-Hosting" },
  { icon: Check, label: "Jeder Entwickler unter NDA" },
];

const VerticalLanding = ({ vertical }: { vertical: Vertical }) => {
  const { icon: Icon, eyebrow, heroHeadline, heroSub, problems, buildPoints } =
    vertical;
  const bookingUrl = auditBookingUrl(vertical.slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [vertical.slug]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        customTitle={vertical.seoTitle}
        customDescription={vertical.seoDescription}
        customImage={vertical.ogImage}
      />

      {/* Top bar */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg text-foreground">xeda.ai</span>
          </Link>
          <Button asChild size="sm">
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              Kostenloses Audit
            </a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
            <Icon className="h-4 w-4" /> {eyebrow}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {heroHeadline}
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            {heroSub}
          </p>
          <Button asChild size="lg" className="px-8">
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              Kostenloses KI-Audit buchen
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            30 Minuten · konkrete Zahlen · ohne Verpflichtung
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Kennen Sie das?
          </h2>
          <ul className="space-y-4">
            {problems.map((p) => (
              <li key={p} className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-3xl">
          <span className="text-sm font-medium text-primary mb-3 block text-center">
            Was wir bauen
          </span>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Ihr KI-Assistent
          </h2>
          <Card className="bg-card border-border/50">
            <CardContent className="p-8">
              <ul className="space-y-4">
                {buildPoints.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-6 pt-6 border-t border-border">
                Beispielhafte Ergebnisse ähnlicher Automatisierungen — kein
                Erfolgsversprechen, sondern das, was wir im Audit konkret für Sie
                durchrechnen.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            So arbeiten wir mit Ihnen
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ icon: StepIcon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <StepIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Finden wir Ihre versteckten Stunden.
          </h2>
          <p className="text-muted-foreground mb-8">
            Im kostenlosen Audit zeigen wir Ihnen in 30 Minuten, wo KI in Ihrem
            Betrieb am meisten Zeit und Geld spart — mit einem klaren Fahrplan und ROI.
          </p>
          <Button asChild size="lg" className="px-8">
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              Kostenloses KI-Audit buchen
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
            {trust.map(({ icon: TrustIcon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <TrustIcon className="h-4 w-4 text-primary" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} xeda.ai</span>
          <div className="flex items-center gap-4">
            <Link to="/impressum" className="hover:text-foreground transition-colors">
              Impressum
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Datenschutz
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors">
              xeda.ai →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VerticalLanding;
