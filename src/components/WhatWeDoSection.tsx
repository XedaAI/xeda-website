import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import XedaWordmark from "@/components/XedaWordmark";
import integrationArt from "@/assets/services/interlocking-modules.webp";
import automationArt from "@/assets/services/document-pipeline.webp";
import copilotsArt from "@/assets/services/assistant-mesh.webp";

// Columns of raw bits falling behind the illustration: the same unstructured-
// input motif the hero's assembly line opens with. Language-neutral.
const STREAMS = [
  { left: "12%", bits: "0110100101101001", dur: "11s", delay: "-2s" },
  { left: "24%", bits: "1001011010011010", dur: "14s", delay: "-7s" },
  { left: "74%", bits: "0101101001011001", dur: "12s", delay: "-4s" },
  { left: "87%", bits: "1100101011010011", dur: "15s", delay: "-10s" },
];

/** How long each service's illustration stays up before the next one. */
const CYCLE_MS = 6000;

const WhatWeDoSection = () => {
  const { t } = useLanguage();

  // Each service has an illustration in place of an icon. They are too
  // detailed to read at icon size, so the panel shows the active one large and
  // the list says which is active.
  const services = [
    { art: integrationArt, titleKey: "whatWeDo.saas.title", descKey: "whatWeDo.saas.desc" },
    { art: automationArt, titleKey: "whatWeDo.mvp.title", descKey: "whatWeDo.mvp.desc" },
    { art: copilotsArt, titleKey: "whatWeDo.automation.title", descKey: "whatWeDo.automation.desc" },
  ];

  const [active, setActive] = useState(0);
  // Auto-advance until someone points at the list, and stop for good once they
  // pick one — a panel that changes under a reader's cursor fights them.
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

  // Only cycle while the section is on screen, so a visitor arriving at it
  // starts from the first service rather than wherever the timer had got to.
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
    const id = window.setTimeout(() => setActive((i) => (i + 1) % services.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, autoplay, services.length]);

  return (
    <section ref={sectionRef} id="what-we-do" className="relative py-28 md:py-36 bg-background">
      {/* Moves each illustration's black point up to its own dark ground, so
          that ground turns true black and the screen blend drops it completely
          — otherwise a faint, lighter rectangle shows under every scheme.
          Highlights are stretched back to full brightness. Defined here rather
          than in the desktop panel: that panel is display:none on phones, and a
          filter inside a hidden subtree does not apply. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id="wwd-blackpoint" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.2821" intercept="-0.2821" />
            <feFuncG type="linear" slope="1.2821" intercept="-0.2821" />
            <feFuncB type="linear" slope="1.2821" intercept="-0.2821" />
          </feComponentTransfer>
        </filter>
      </svg>
      <div className="container mx-auto px-6">
        {/* Statement on the left, a framed visual on the right. */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-20 items-stretch">
          <div>
            <span className="text-sm font-semibold tracking-wide text-muted-foreground mb-5 block">{t("whatWeDo.label")}</span>
            <h2 className="font-display font-medium uppercase text-[2.35rem] sm:text-5xl xl:text-[3.6rem] leading-[1.02] tracking-[-0.005em] text-primary mb-8 text-balance">
              {t("whatWeDo.title")}
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-foreground/90 max-w-xl mb-10">
              {t("whatWeDo.subtitle")}
            </p>

            <ul className="space-y-2" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
              {services.map((service, index) => {
                const isActive = index === active;
                return (
                  <li key={service.titleKey} className="enter" style={{ "--enter-delay": `${index * 0.08}s` } as React.CSSProperties}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => { setActive(index); setChosen(true); }}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      className={`wwd-item group relative w-full text-left flex gap-5 rounded-xl px-5 py-5 transition-colors ${isActive ? "bg-accent/60" : "hover:bg-accent/30"}`}
                    >
                      <span className={`font-mono text-sm pt-1 tabular-nums transition-colors ${isActive ? "text-brand-accent" : "text-muted-foreground"}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="block">
                        <span className={`block text-lg font-semibold mb-1.5 transition-colors ${isActive ? "text-foreground" : "text-foreground/75"}`}>
                          {t(service.titleKey)}
                        </span>
                        <span className="block text-muted-foreground leading-relaxed">{t(service.descKey)}</span>
                        {/* Phones: the illustration opens under its own service
                            instead of in a panel below the whole list, where it
                            would be out of sight. Every fold is the same height
                            and exactly one is open, so the page length holds
                            steady while it cycles. Spans throughout, since a
                            button may only hold phrasing content. */}
                        <span className={`wwd-fold lg:hidden ${isActive ? "is-open" : ""}`} aria-hidden="true">
                          <span className="wwd-fold-inner">
                            <span className="section-ink wwd-panel wwd-panel--mini">
                              <img src={service.art} alt="" decoding="async" className="wwd-art-inline" />
                            </span>
                          </span>
                        </span>
                      </span>
                      {/* How long until the next service, while it is cycling. */}
                      {isActive && autoplay && (
                        <span key={active} className="wwd-progress" style={{ "--wwd-cycle": `${CYCLE_MS}ms` } as React.CSSProperties} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Desktop only (phones get the folds above). Decorative: the list
              carries the content, so the panel is hidden from assistive tech
              and its images have empty alt text.
              section-ink keeps it a dark panel in both themes, the way a
              photograph would stay dark. */}
          <div aria-hidden="true" className="section-ink wwd-panel relative hidden lg:block lg:min-h-[560px]">
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
            <div className="absolute inset-x-0 top-0 bottom-20 sm:bottom-24 flex items-center justify-center">
              {services.map((service, index) => (
                <img
                  key={service.titleKey}
                  src={service.art}
                  alt=""
                  decoding="async"
                  className={`wwd-art ${index === active ? "is-active" : ""}`}
                />
              ))}
            </div>
            <XedaWordmark className="absolute left-1/2 -translate-x-1/2 bottom-9 sm:bottom-11 h-5 sm:h-6 w-auto text-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
