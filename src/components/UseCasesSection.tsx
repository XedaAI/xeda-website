import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import XedaWordmark from "@/components/XedaWordmark";
import accountingArt from "@/assets/use-cases/accounting.webp";
import manufacturingArt from "@/assets/use-cases/manufacturing.webp";
import ecommerceArt from "@/assets/use-cases/ecommerce.webp";
import realestateArt from "@/assets/use-cases/realestate.webp";
import medicalArt from "@/assets/use-cases/medical.webp";
import constructionArt from "@/assets/use-cases/construction.webp";

// Illustrative use cases — examples of what we build, NOT specific client data.
// Each one links to that industry's landing page (src/data/verticals.ts), so
// the six areas are a funnel rather than a static list.
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

// The same falling-bits motif as the What We Build panel, mirrored.
const STREAMS = [
  { left: "10%", bits: "1001011010011010", dur: "13s", delay: "-5s" },
  { left: "23%", bits: "0110100101101001", dur: "11s", delay: "-1s" },
  { left: "78%", bits: "1100101011010011", dur: "15s", delay: "-9s" },
  { left: "89%", bits: "0101101001011001", dur: "12s", delay: "-3s" },
];

/** How long each use case stays up before the next one. */
const CYCLE_MS = 6500;

/** A picture with the pulse over its AI core. */
const Frame = ({ art, core, className }: { art: string; core: string[]; className: string }) => (
  <span className={className} style={{ "--core-x": core[0], "--core-y": core[1] } as React.CSSProperties}>
    <img src={art} alt="" loading="lazy" decoding="async" className="uc-art" />
    <span className="uc-core" />
  </span>
);

const UseCasesSection = () => {
  const { t } = useLanguage();

  // The What We Build section's behaviour, mirrored: one use case is open at a
  // time; it advances on its own until someone points at the list, and stops
  // for good once they pick one.
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const autoplay = inView && !hovering && !chosen && !reducedMotion;
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % cases.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, autoplay]);

  // Every open body is given the height of the longest one, so the list — and
  // everything below it — holds still as the open item moves down the list.
  const listRef = useRef<HTMLUListElement>(null);
  const [bodyMin, setBodyMin] = useState(0);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measures = [...list.querySelectorAll<HTMLElement>("[data-uc-measure]")];
    const update = () => setBodyMin(Math.max(...measures.map((m) => m.offsetHeight)));
    update();
    const ro = new ResizeObserver(update);
    measures.forEach((m) => ro.observe(m));
    return () => ro.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="use-cases" className="relative py-28 md:py-36 section-ink">
      <div className="container mx-auto px-6">
        {/* A framed visual on the left, the statement and list on the right. */}
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-14 lg:gap-20 items-start">
          {/* Desktop only (phones get the folds below). Decorative: the list
              carries the content. Sticky, so the picture stays beside the
              list while it is read. */}
          <div
            aria-hidden="true"
            className="wwd-panel wwd-panel--mirror relative hidden lg:block lg:sticky lg:top-28 lg:h-[min(640px,calc(100vh-9rem))]"
          >
            <div className="wwd-streams">
              {STREAMS.map((s) => (
                <span
                  key={s.left}
                  className="wwd-stream"
                  style={{ left: s.left, "--dur": s.dur, "--delay": s.delay } as React.CSSProperties}
                >
                  {s.bits}
                </span>
              ))}
            </div>
            <div className="absolute inset-x-0 top-0 bottom-20 sm:bottom-24">
              {cases.map((c, index) => (
                <Frame key={c.key} art={c.art} core={c.core} className={`uc-frame ${index === active ? "is-active" : ""}`} />
              ))}
            </div>
            <XedaWordmark className="absolute left-1/2 -translate-x-1/2 bottom-9 sm:bottom-11 h-5 sm:h-6 w-auto text-foreground" />
          </div>

          <div>
            <span className="text-sm font-semibold tracking-wide text-muted-foreground mb-5 block">{t("useCases.label")}</span>
            <h2 className="font-display font-medium uppercase text-[2.35rem] sm:text-5xl xl:text-[3.6rem] leading-[1.02] tracking-[-0.005em] text-brand-accent mb-8 text-balance">
              {t("useCases.title")}
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-foreground/90 max-w-xl mb-10">
              {t("useCases.subtitle")}
            </p>

            <ul ref={listRef} className="space-y-2" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
              {cases.map((c, index) => {
                const isActive = index === active;
                const panelId = `use-case-${c.key}`;
                return (
                  <li
                    key={c.key}
                    className={`enter relative rounded-xl transition-colors ${isActive ? "bg-accent/60" : "hover:bg-accent/30"}`}
                    style={{ "--enter-delay": `${index * 0.06}s` } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={panelId}
                      onClick={() => { setActive(index); setChosen(true); }}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      className="w-full text-left flex gap-5 rounded-xl px-5 pt-5 pb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className={`font-mono text-sm pt-1 tabular-nums transition-colors ${isActive ? "text-brand-accent" : "text-muted-foreground"}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="block">
                        <span className={`block text-lg font-semibold mb-1.5 transition-colors ${isActive ? "text-foreground" : "text-foreground/75"}`}>
                          {t(`useCases.${c.key}.industry`)}
                        </span>
                        <span className="block text-muted-foreground leading-relaxed">{t(`useCases.${c.key}.outcome`)}</span>
                      </span>
                    </button>

                    <div id={panelId} className={`wwd-fold ${isActive ? "is-open" : ""}`}>
                      {/* Closed bodies are inert so their link is not tabbed
                          into unseen. */}
                      <div className="wwd-fold-inner" {...(!isActive ? { inert: "" } : {})}>
                        <div className="pl-[3.6rem] pr-5 pb-5">
                          <div style={{ minHeight: bodyMin || undefined }}>
                          <div data-uc-measure>
                            {/* Phones: the picture opens under its own case. */}
                            <span className="wwd-panel wwd-panel--mirror wwd-panel--mini relative block lg:hidden mb-4" aria-hidden="true">
                              <Frame art={c.art} core={c.core} className="uc-frame uc-frame--mini" />
                            </span>
                            <p className="text-sm text-muted-foreground mb-2.5">
                              <span className="font-semibold text-foreground/70">Problem: </span>
                              {t(`useCases.${c.key}.problem`)}
                            </p>
                            <p className="text-sm text-foreground/80">
                              <span className="font-semibold text-primary">{t("useCases.weBuild")}: </span>
                              {t(`useCases.${c.key}.build`)}
                            </p>
                            <Link
                              to={`/${c.slug}`}
                              className="group mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {t("useCases.learnMore")}
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* How long until the next case, while it is cycling. */}
                    {isActive && autoplay && (
                      <span key={active} className="wwd-progress" style={{ "--wwd-cycle": `${CYCLE_MS}ms` } as React.CSSProperties} />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
