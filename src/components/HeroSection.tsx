import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { auditBookingUrl } from "@/lib/booking";
import { useParallax } from "@/hooks/useParallax";
import AIRobot from "@/components/AIRobot";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { t } = useLanguage();
  const bgRef = useParallax<HTMLDivElement>(0.3);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden accent-glow">
      <div
        ref={bgRef}
        className="absolute top-0 left-0 right-0 h-[140%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* The hero is always a dark panel (photo + scrim), so its colours are
          fixed rather than taken from --foreground / --primary-foreground.
          Those tokens invert between themes, which previously flipped this
          scrim light in dark mode and washed the whole hero out. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(208_44%_6%/0.88)] via-[hsl(208_44%_8%/0.80)] to-[hsl(208_50%_4%/0.96)]" />

      {/* Robot fills the first viewport behind the content; bursts apart on scroll-down */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none overflow-hidden">
        <AIRobot className="opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(194_90%_56%/0.10)] border border-[hsl(194_90%_56%/0.30)] mb-8">
          <span className="w-2 h-2 rounded-full bg-[hsl(194_90%_60%)] animate-pulse" />
          <span className="text-sm text-[hsl(200_18%_96%/0.88)]">{t("hero.badge")}</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[hsl(200_18%_97%)] mb-6 leading-tight">
          {t("hero.title")}
          {/* Lifted off --primary: the deep blueprint blue is too dark to read
              against the scrim, so the highlight uses the light-ground tint. */}
          <span className="text-[hsl(194_90%_62%)]"> {t("hero.titleHighlight")}</span>
        </h1>

        <p className="text-lg md:text-xl text-[hsl(205_16%_88%/0.78)] mb-10 max-w-2xl mx-auto leading-relaxed">
          {t("hero.subtitle")}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="px-8">
            <a href={auditBookingUrl("hero")} target="_blank" rel="noopener noreferrer">
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => scrollToSection("what-we-do")}
            className="px-8 bg-[hsl(200_18%_96%/0.06)] border-[hsl(200_18%_96%/0.24)] text-[hsl(200_18%_96%)] hover:bg-[hsl(200_18%_96%/0.12)] hover:text-[hsl(200_18%_99%)]"
          >
            {t("hero.secondary")}
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-[hsl(200_18%_96%/0.34)] flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-[hsl(200_18%_96%/0.55)] rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
