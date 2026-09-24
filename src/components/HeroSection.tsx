import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { auditBookingUrl } from "@/lib/booking";
import { useParallax } from "@/hooks/useParallax";
import { useRef } from "react";
import AssemblyLine from "@/components/AssemblyLine";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { t } = useLanguage();
  const bgRef = useParallax<HTMLDivElement>(0.3);
  // The mark is now the collar the pipe runs through, and AssemblyLine draws
  // it — only there can its far half sit behind the pipe and its near half in
  // front. This box reserves the room and tells the line where to put it; its
  // height is the collar's diameter and the pipe is sized off that.
  const markRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* The photo is a purple stock image, and the scrim above it lets
          4-14% of it through — enough to tint the hero purple under any colour
          scheme. Greyscale keeps its texture and lets the scrim's colour be
          the only colour here. */}
      <div
        ref={bgRef}
        className="absolute top-0 left-0 right-0 h-[140%] bg-cover bg-center grayscale will-change-transform"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* The hero is always a dark panel (photo + scrim), so its colours are
          fixed rather than taken from theme tokens — those invert between
          themes, which previously flipped this scrim light in dark mode. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(160_47%_13%/0.92)] via-[hsl(160_47%_15%/0.86)] to-[hsl(160_50%_8%/0.96)]" />

      {/* Chaos into the intake, order out of the outlet, the mark as the collar
          it all runs through — what we do, watchable. Behind the content,
          never interactive. */}
      <AssemblyLine coreRef={markRef} className="absolute inset-0 z-[1]" />
      {/* Legibility scrim: the line stays saturated at the edges, but dims under
          the text column so nothing drifting past ever fights the headline.
          It sits lower and shorter than it used to — centred at 58% with a 52%
          radius it reached the collar and dimmed its lower half to 0.58 while
          leaving the top untouched, which read as a ring with a piece missing.
          Now it clears the collar's bottom edge and starts at the badge. */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 54% 42% at 50% 65%, hsl(160 47% 12% / 0.92) 0%, hsl(160 47% 12% / 0.58) 44%, transparent 74%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 pt-28 pb-16 text-center max-w-4xl">
        <div
          ref={markRef}
          aria-hidden="true"
          className="h-[160px] w-[160px] md:h-[236px] md:w-[236px] mx-auto mb-8 md:mb-10"
        />

        <div className="enter [--enter-delay:1.25s] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(27_74%_66%/0.10)] border border-[hsl(27_74%_66%/0.34)] mb-8">
          <span className="w-2 h-2 rounded-full bg-[hsl(27_74%_66%)] animate-pulse" />
          <span className="text-sm text-[hsl(150_29%_92%)]">{t("hero.badge")}</span>
        </div>

        <h1 className="enter [--enter-delay:1.4s] text-[2.6rem] md:text-6xl lg:text-[4.6rem] font-semibold tracking-[-0.03em] text-[hsl(40_37%_97%)] mb-7 leading-[1.06] text-balance">
          {t("hero.title")}
          {/* The second half of the headline in a light green (8.5:1 on the
              scrim): green stays the lead colour even at the loudest moment,
              and the orange keeps to the badge dot. */}
          <span className="text-[hsl(153_42%_72%)]"> {t("hero.titleHighlight")}</span>
        </h1>

        <p className="enter [--enter-delay:1.55s] text-lg md:text-xl text-[hsl(150_20%_84%)] mb-12 max-w-[38rem] mx-auto leading-[1.65]">
          {t("hero.subtitle")}
        </p>
        
        <div className="enter [--enter-delay:1.7s] flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* The hero is a fixed dark panel, so the CTA is fixed too: the
              primary green #1F6B52 with white text (6.4:1), hover #185641. It
              sits on a deeper green than #173F32, and a hairline edge keeps
              the button's outline clear of the ground. */}
          <Button
            size="lg"
            asChild
            className="px-8 bg-[hsl(160_55%_27%)] text-white border border-[hsl(150_29%_92%/0.22)] hover:bg-[hsl(160_56%_22%)]"
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
            className="px-8 bg-transparent border-[hsl(150_29%_92%/0.30)] text-[hsl(150_29%_92%)] hover:bg-[hsl(150_29%_92%/0.10)] hover:text-[hsl(0_0%_100%)]"
          >
            {t("hero.secondary")}
          </Button>
        </div>
      </div>

      <div className="enter [--enter-delay:2.1s] absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-[hsl(150_29%_92%/0.36)] flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-[hsl(27_74%_66%/0.8)] rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
