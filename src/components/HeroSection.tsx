import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { auditBookingUrl } from "@/lib/booking";
import { useParallax } from "@/hooks/useParallax";
import { lazy, Suspense } from "react";
import XedaMarkAnimated from "@/components/XedaMarkAnimated";
import heroBg from "@/assets/hero-bg.jpg";

// Three.js is ~150KB gzipped, so the 3D network loads on demand rather than in
// the main bundle; the hero renders its text immediately and the scene fades in.
const NetworkScene = lazy(() => import("@/components/NetworkScene"));

const HeroSection = () => {
  const { t } = useLanguage();
  const bgRef = useParallax<HTMLDivElement>(0.3);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        ref={bgRef}
        className="absolute top-0 left-0 right-0 h-[140%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* The hero is always a dark panel (photo + scrim), so its colours are
          fixed rather than taken from theme tokens — those invert between
          themes, which previously flipped this scrim light in dark mode. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_12%_5%/0.90)] via-[hsl(220_12%_6%/0.84)] to-[hsl(220_14%_3%/0.96)]" />

      {/* 3D network of a client's systems connected through the AI core — the
          integration story rendered. Assembles on load, re-bursts on scroll,
          tilts with the cursor. Behind the content, never interactive. */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <Suspense fallback={null}>
          <NetworkScene className="absolute inset-0 opacity-60" />
        </Suspense>
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-28 pb-16 text-center max-w-4xl">
        <XedaMarkAnimated className="h-28 md:h-36 w-auto mx-auto mb-10 text-[hsl(220_8%_96%)]" />

        <div className="enter [--enter-delay:1.25s] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(220_8%_96%/0.07)] border border-[hsl(220_8%_96%/0.20)] mb-8">
          <span className="w-2 h-2 rounded-full bg-[hsl(220_8%_88%)] animate-pulse" />
          <span className="text-sm text-[hsl(220_8%_96%/0.86)]">{t("hero.badge")}</span>
        </div>

        <h1 className="enter [--enter-delay:1.4s] text-[2.6rem] md:text-6xl lg:text-[4.6rem] font-semibold tracking-[-0.03em] text-[hsl(220_8%_97%)] mb-7 leading-[1.06] text-balance">
          {t("hero.title")}
          {/* Monochrome: the highlight steps down in tone rather than changing
              hue, so emphasis comes from contrast instead of colour. */}
          <span className="text-[hsl(220_7%_66%)]"> {t("hero.titleHighlight")}</span>
        </h1>

        <p className="enter [--enter-delay:1.55s] text-lg md:text-xl text-[hsl(220_7%_88%/0.74)] mb-12 max-w-[38rem] mx-auto leading-[1.65]">
          {t("hero.subtitle")}
        </p>
        
        <div className="enter [--enter-delay:1.7s] flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* The hero is a fixed dark panel, so the CTA is fixed too: in light
              mode --primary is near-black, which would sit dark-on-dark here. */}
          <Button
            size="lg"
            asChild
            className="px-8 bg-[hsl(220_8%_96%)] text-[hsl(220_12%_8%)] hover:bg-[hsl(0_0%_100%)]"
          >
            <a href={auditBookingUrl("hero")} target="_blank" rel="noopener noreferrer">
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => scrollToSection("what-we-do")}
            className="px-8 bg-transparent border-[hsl(220_8%_96%/0.28)] text-[hsl(220_8%_96%)] hover:bg-[hsl(220_8%_96%/0.10)] hover:text-[hsl(220_8%_99%)]"
          >
            {t("hero.secondary")}
          </Button>
        </div>
      </div>

      <div className="enter [--enter-delay:2.1s] absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-[hsl(220_8%_96%/0.30)] flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-[hsl(220_8%_96%/0.5)] rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
