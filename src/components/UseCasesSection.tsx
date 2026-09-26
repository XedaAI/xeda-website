import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { industries, tx } from "@/components/industries/data";
import IndustrySelector from "@/components/industries/IndustrySelector";
import DesktopScene from "@/components/industries/DesktopScene";
import MobileScene from "@/components/industries/MobileScene";
import type { Phase } from "@/components/industries/XedaNode";
import { RUN_MS } from "@/components/industries/timing";

// Industries, as one repeated demonstration: messy work goes in, Xeda works
// on it, structured action comes out. Nothing runs on its own — the visitor
// presses Xeda, then can put it back and try another industry. Switching
// industry fades to the new scene in its "before" state.
//
// Two compositions share this state: DesktopScene (side by side, from lg)
// and MobileScene (a compact vertical card, below lg). Only one is mounted,
// so a phone never lays out or animates the desktop scene.

const FADE_MS = 200;
const DESKTOP = "(min-width: 1024px)";

const useMedia = (query: string) => {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return match;
};

const UseCasesSection = () => {
  const { t, language: lang } = useLanguage();
  const isDesktop = useMedia(DESKTOP);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const [active, setActive] = useState(0); // selected tab
  const [shown, setShown] = useState(0); // scene on stage (lags during the fade)
  const [phase, setPhase] = useState<Phase>("before");
  const [fading, setFading] = useState(false);
  const [offscreen, setOffscreen] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const clearTimers = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };
  useEffect(() => clearTimers, []);

  // Pause the idle animations while the section is off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A layout change mid-run (a tablet turned sideways) starts the scene over.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const restart = () => { clearTimers(); setPhase("before"); };
    mq.addEventListener("change", restart);
    return () => mq.removeEventListener("change", restart);
  }, []);

  const industry = industries[shown];

  const select = (i: number) => {
    if (i === active) return;
    clearTimers();
    setActive(i);
    setFading(true);
    timers.current.push(window.setTimeout(() => {
      setShown(i);
      setPhase("before");
      setFading(false);
    }, reducedMotion ? 0 : FADE_MS));
  };

  // From the phone's previous/next controls, below the result: if the start
  // of the section has scrolled away, bring the selector back into view so
  // the new industry is seen from its beginning. Only then — it never moves
  // the page otherwise.
  const selectFromBelow = (i: number) => {
    select(i);
    const top = selectorRef.current?.getBoundingClientRect().top ?? 0;
    const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    if (top < header) window.scrollBy({ top: top - header - 12, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const run = () => {
    if (phase !== "before") return;
    if (reducedMotion) { setPhase("after"); return; }
    setPhase("processing");
    timers.current.push(window.setTimeout(() => setPhase("after"), isDesktop ? RUN_MS.desktop : RUN_MS.phone));
  };
  const reset = () => { clearTimers(); setPhase("before"); };
  // Replay: back to the before state for a beat, then run again. The inputs
  // keep the travel vectors measured on the first run.
  const replay = () => {
    clearTimers();
    setPhase("before");
    if (reducedMotion) { setPhase("after"); return; }
    timers.current.push(window.setTimeout(() => {
      setPhase("processing");
      timers.current.push(window.setTimeout(() => setPhase("after"), isDesktop ? RUN_MS.desktop : RUN_MS.phone));
    }, 450));
  };

  return (
    <section ref={sectionRef} id="use-cases" lang={lang} className="py-28 md:py-36 section-ink" data-offscreen={offscreen ? "" : undefined}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-8 lg:mb-10">
          <span className="text-sm font-semibold tracking-wide text-brand-accent mb-4 block">{t("useCases.label")}</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.022em] text-foreground mb-5 text-balance">{t("useCases.title")}</h2>
          <p className="text-foreground/90 text-lg max-w-2xl mx-auto">{t("useCases.introCta")}</p>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            <span className="text-brand-accent font-medium">{t("useCases.introLine")}</span>{" "}
            <span className="text-sm">{t("useCases.introNote")}</span>
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div ref={selectorRef}>
            <IndustrySelector active={active} onSelect={select} t={t} reducedMotion={reducedMotion} />
          </div>

          <div className="ix-demo">
            {isDesktop ? (
              <DesktopScene industry={industry} phase={phase} fading={fading} lang={lang} t={t} onRun={run} onReset={reset} onReplay={replay} />
            ) : (
              <MobileScene
                industry={industry}
                index={active}
                phase={phase}
                fading={fading}
                lang={lang}
                t={t}
                onActivate={run}
                onReset={reset}
                onReplay={replay}
                onSelect={selectFromBelow}
              />
            )}
          </div>

          <p className="sr-only" aria-live="polite">{phase === "after" ? tx(industry.summary, lang) : ""}</p>

          {/* The industry in words, under the demonstration. All six are laid
              in one grid cell so the tallest sets the height and switching
              never moves the page; only the shown one is visible. */}
          <div className="ix-copy-stack" data-fading={fading ? "" : undefined}>
            {industries.map((ind, i) => (
              <div key={ind.key} className={`ix-copy ${i === shown ? "is-shown" : ""}`} aria-hidden={i !== shown}>
                <div>
                  <span className="ix-copy-label">{t("useCases.problem")}</span>
                  <p>{t(`useCases.${ind.key}.problem`)}</p>
                </div>
                <div>
                  <span className="ix-copy-label text-primary">{t("useCases.weBuild")}</span>
                  <p>{t(`useCases.${ind.key}.build`)}</p>
                </div>
                <div>
                  <span className="ix-copy-label text-brand-accent">{t("useCases.outcome")}</span>
                  <p className="text-foreground">{t(`useCases.${ind.key}.outcome`)}</p>
                </div>
                <Link
                  to={`/${ind.slug}`}
                  tabIndex={i === shown ? undefined : -1}
                  className="group inline-flex min-h-11 items-center gap-1.5 self-end whitespace-nowrap text-sm font-medium text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("useCases.learnMore")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
