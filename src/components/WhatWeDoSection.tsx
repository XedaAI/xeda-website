import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import XedaWordmark from "@/components/XedaWordmark";
import Parallax from "@/components/Parallax";
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

/** How long each service stays up before the next one, when cycling. */
const CYCLE_MS = 6000;
/** Scroll distance per service while the section is held, in viewport heights. */
const STEP_VH = 60;
/** Desktop windows tall enough to hold the whole section on screen, with a
 *  mouse or trackpad: a touch swipe's momentum cannot be held back, so a
 *  touch screen (a tablet held sideways) gets the normal section instead. */
const PIN_QUERY = "(min-width: 1024px) and (min-height: 600px) and (pointer: fine)";
/** Wheel stepping: a pause this long ends a gesture, and each service stays
 *  in view at least this long before the next gesture can move on. */
const GESTURE_GAP_MS = 180;
const MIN_STEP_MS = 550;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** A step's record for the wheel: which service, and when (handlers only). */
const stamp = (k: number) => ({ k, at: performance.now() });
const mq = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;
const headerHeight = () => document.querySelector("header")?.getBoundingClientRect().height ?? 72;

/** Scroll so that service k of the held section is the one in view. */
const scrollToStep = (section: HTMLElement, k: number, n: number) => {
  const headerH = headerHeight();
  const r = section.getBoundingClientRect();
  const span = r.height - (window.innerHeight - headerH);
  const target = window.scrollY + r.top - headerH + span * ((k + 0.12) / n);
  window.scrollTo({ top: target, behavior: "smooth" });
};

const WhatWeDoSection = () => {
  const { t, language } = useLanguage();

  // Each service has an illustration in place of an icon. They are too
  // detailed to read at icon size, so the panel shows the active one large and
  // the list says which is active.
  const services = [
    { art: integrationArt, titleKey: "whatWeDo.saas.title", descKey: "whatWeDo.saas.desc" },
    { art: automationArt, titleKey: "whatWeDo.mvp.title", descKey: "whatWeDo.mvp.desc" },
    { art: copilotsArt, titleKey: "whatWeDo.automation.title", descKey: "whatWeDo.automation.desc" },
  ];
  const n = services.length;

  const [active, setActive] = useState(0);
  // Read synchronously, so the very first layout already has the section's
  // real height (a reload restores the scroll position against that layout).
  const [reducedMotion, setReducedMotion] = useState(() => mq("(prefers-reduced-motion: reduce)"));
  const [isDesktop, setIsDesktop] = useState(() => mq("(min-width: 1024px)"));
  const [tallEnough, setTallEnough] = useState(() => mq(PIN_QUERY));
  // Whether the held content actually fits the window (it is measured; German
  // runs longer than English). If not, the section stays a normal section.
  const [fits, setFits] = useState(true);
  const [fitLanguage, setFitLanguage] = useState(language);
  if (fitLanguage !== language) { setFitLanguage(language); setFits(true); }
  // Desktop: the section holds still while you scroll, and the scroll walks
  // through the three services, so nobody passes it having seen only one.
  const pinned = tallEnough && !reducedMotion && fits;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const tall = window.matchMedia(PIN_QUERY);
    const sync = () => {
      setReducedMotion(motion.matches);
      setIsDesktop(desktop.matches);
      setTallEnough(tall.matches);
    };
    [motion, desktop, tall].forEach((m) => m.addEventListener("change", sync));
    // After a resize, try holding again; the measurement decides.
    let id = 0;
    const onResize = () => { window.clearTimeout(id); id = window.setTimeout(() => setFits(true), 200); };
    window.addEventListener("resize", onResize);
    return () => {
      [motion, desktop, tall].forEach((m) => m.removeEventListener("change", sync));
      window.removeEventListener("resize", onResize);
      window.clearTimeout(id);
    };
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // --- Held section: scroll position → active service -----------------------
  // Progress runs 0 → 1 over the scroll the section is held for; each service
  // owns a third of it. The bars and the drift read it as CSS variables, so
  // scrolling never re-renders; only crossing into the next service does.
  useEffect(() => {
    if (!pinned) return;
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const headerH = headerHeight();
      section.style.setProperty("--wwd-header", `${headerH}px`);
      // Does the held content fit under the header? Measured with the longest
      // description open, so the answer does not change from one service to
      // the next. The column is then placed from the top with room to spare
      // split evenly, so it never moves while the services change.
      const col = sticky.querySelector<HTMLElement>("[data-wwd-col]");
      const stage = sticky.querySelector<HTMLElement>(".wwd-stage");
      if (col && col.firstElementChild && col.lastElementChild) {
        const top = col.firstElementChild.getBoundingClientRect().top;
        const bottom = col.lastElementChild.getBoundingClientRect().bottom;
        const descs = [...col.querySelectorAll<HTMLElement>(".wwd-desc")];
        const open = descs.reduce((sum, d) => sum + d.getBoundingClientRect().height, 0);
        const longest = Math.max(0, ...descs.map((d) => (d.firstElementChild as HTMLElement | null)?.scrollHeight ?? 0));
        const contentH = bottom - top - open + longest;
        const avail = window.innerHeight - headerH;
        if (contentH + 24 > avail) {
          // Not before the site's fonts are in: the stand-in font runs wider,
          // so German would measure too tall and give up holding for nothing.
          if (document.fonts && document.fonts.status !== "loaded") { void document.fonts.ready.then(onScroll); return; }
          setFits(false);
          return;
        }
        const rowH = Math.max(contentH, stage?.getBoundingClientRect().height ?? 0);
        sticky.style.setProperty("--wwd-pad", `${Math.max(12, (avail - rowH) / 2).toFixed(0)}px`);
      }
      const r = section.getBoundingClientRect();
      const span = r.height - (window.innerHeight - headerH);
      const p = span > 0 ? clamp01((headerH - r.top) / span) : 0;
      sticky.style.setProperty("--wwd-p", p.toFixed(4));
      for (let k = 0; k < n; k++) sticky.style.setProperty(`--wwd-s${k}`, clamp01(p * n - k).toFixed(4));
      const idx = Math.min(n - 1, Math.floor(p * n));
      setActive((a) => (a === idx ? a : idx));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(measure); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [pinned, n]);

  // Where the last step was going (by wheel, Page Down / Up or a click on a
  // service) and when, so a quick next wheel gesture counts on from there.
  const lastStep = useRef({ k: -1, at: -Infinity });

  // Picking a service while held scrolls to its part of the section.
  const goTo = (k: number) => {
    const section = sectionRef.current;
    if (!pinned || !section) { setActive(k); setChosen(true); return; }
    lastStep.current = stamp(k);
    scrollToStep(section, k, n);
  };

  // Page Down / Space (and Page Up / Shift+Space) step one service at a time
  // while the section is held; a full page would skip one. At the first or
  // last service the keys scroll the page as usual.
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (e.key === " " && target?.closest("button, a, [role='button']")) return;
      const down = e.key === "PageDown" || (e.key === " " && !e.shiftKey);
      const up = e.key === "PageUp" || (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      const section = sectionRef.current;
      if (!section) return;
      const r = section.getBoundingClientRect();
      const held = r.top <= headerHeight() + 2 && r.bottom >= window.innerHeight - 2;
      const next = activeRef.current + (down ? 1 : -1);
      if (!held || next < 0 || next >= n) return;
      e.preventDefault();
      lastStep.current = stamp(next);
      scrollToStep(section, next, n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned, n]);

  // The wheel, the same way. A fast flick or a hard spin would otherwise race
  // through the held stretch and skip a service or two. Going down, arriving
  // from above stops on the first service, and each wheel or trackpad gesture
  // after that moves exactly one service on; the rest of the gesture (a
  // trackpad's momentum, a wheel still spinning) is absorbed. After the last
  // service the wheel scrolls the page as usual. Going up is never held back,
  // nor are the scrollbar and the keyboard's Home / End, nor anything under
  // the pointer that scrolls by itself (the chat window, a menu).
  useEffect(() => {
    if (!pinned) return;
    let locked = false; // absorbing the rest of the gesture that made a step
    let pending = false; // a new gesture began while the last step was settling
    let stepAt = -Infinity;
    let lastAt = -Infinity;
    // The absorbed gesture's shape, smoothed (wheel deltas jitter from one
    // event to the next even at a steady speed): it speeds up to a peak,
    // then a trackpad's momentum dies away. Only once it has really died
    // down does speeding up again count as a fresh push.
    let avg = 0;
    let peak = 0;
    let slowing = false;
    // Where the page is being carried to on the way in (see below).
    let glide = -1;
    const step = (section: HTMLElement, k: number, now: number, mag: number) => {
      lastStep.current = { k, at: now };
      stepAt = now;
      locked = true;
      pending = false;
      avg = mag;
      peak = mag;
      slowing = false;
      glide = -1;
      scrollToStep(section, k, n);
    };
    const release = () => { locked = false; pending = false; glide = -1; };
    // Something under the pointer that can still scroll this way takes it.
    const scrollsItself = (target: EventTarget | null, dy: number) => {
      for (let el = target instanceof Element ? target : null; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
        if (el.scrollHeight <= el.clientHeight + 1) continue;
        const oy = getComputedStyle(el).overflowY;
        if (oy !== "auto" && oy !== "scroll" && oy !== "overlay") continue;
        if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
      }
      return false;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey) return; // ctrl + wheel is zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const now = performance.now();
      const gap = now - lastAt;
      lastAt = now;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      const mag = Math.abs(dy);
      if (dy <= 0) { release(); lastStep.current.k = -1; return; }
      if (scrollsItself(e.target, dy)) return;

      const section = sectionRef.current;
      if (!section) return;
      const headerH = headerHeight();
      const r = section.getBoundingClientRect();
      const span = r.height - (window.innerHeight - headerH);
      if (span <= 0) return;
      const p = (headerH - r.top) / span;
      if (p >= 1) { release(); return; } // past it: an ordinary page

      if (locked) {
        // A new gesture: one after a pause, or a fresh push during the
        // momentum of the last. It moves on once the service it brought up
        // has been in view for the minimum time; until then it waits.
        avg = avg * 0.6 + mag * 0.4;
        if (gap > GESTURE_GAP_MS) pending = true;
        else if (!slowing) {
          if (avg > peak) peak = avg;
          else if (avg < peak * 0.35) slowing = true;
        } else if (avg > Math.max(20, peak * 0.5)) pending = true;
        if (pending && now - stepAt >= MIN_STEP_MS) { locked = false; pending = false; }
        else { e.preventDefault(); return; }
      }

      if (p < 0) {
        // Approaching from above. Once it is within reach, carry the page
        // there ourselves: a browser only lets a page stop a gesture whose
        // first event it took, so a fast flick begun just above would
        // otherwise fly straight through. Arriving stops on the first service.
        const toStart = -p * span;
        if (toStart > window.innerHeight * 1.5) return;
        e.preventDefault();
        const from = glide > window.scrollY ? glide : window.scrollY;
        if (from + dy < window.scrollY + toStart) {
          glide = from + dy;
          // A trackpad's small steps land at once; a wheel's notches glide.
          window.scrollTo({ top: glide, behavior: mag >= 50 ? "smooth" : "auto" });
          return;
        }
        step(section, 0, now, mag);
        return;
      }
      // Count from where the last step was going if it has not got there
      // yet, so a quick second gesture does not land on the same service.
      const at = Math.min(n - 1, Math.floor(p * n));
      const last = lastStep.current;
      const from = now - last.at < 900 && last.k > at ? last.k : at;
      if (from >= n - 1) return; // the last one: scroll on
      e.preventDefault();
      step(section, from + 1, now, mag);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [pinned, n]);

  // --- Desktop without holding (short window or reduced motion) -------------
  // The panel cycles until someone points at or tabs into the list, and stops
  // for good once they pick one.
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const autoplay = isDesktop && !pinned && inView && !hovering && !focused && !chosen && !reducedMotion;
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % n), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, autoplay, n]);

  // --- Phones: every service with its picture, revealed as it arrives -------
  // The service crossing the middle of the screen is the highlighted one.
  useEffect(() => {
    if (isDesktop) return;
    const list = listRef.current;
    if (!list) return;
    const items = [...list.querySelectorAll<HTMLElement>("[data-wwd-item]")];
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        // An attribute React does not manage, so re-renders keep it.
        if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = ""; reveal.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    const centre = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.wwdItem));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    items.forEach((el) => { reveal.observe(el); centre.observe(el); });
    return () => { reveal.disconnect(); centre.disconnect(); };
  }, [isDesktop]);

  const heading = (
    <>
      <span className="text-sm font-semibold tracking-wide text-muted-foreground mb-5 block">{t("whatWeDo.label")}</span>
      <h2 className="wwd-h2 font-display font-medium uppercase text-[2.35rem] sm:text-5xl xl:text-[3.6rem] leading-[1.02] tracking-[-0.005em] text-brand-accent mb-8 text-balance">
        {t("whatWeDo.title")}
      </h2>
      <p className="wwd-sub text-lg md:text-xl leading-relaxed text-foreground/90 max-w-xl mb-10">
        {t("whatWeDo.subtitle")}
      </p>
    </>
  );

  return (
    <section
      ref={sectionRef}
      id="what-we-do"
      className={pinned ? "wwd-held relative bg-background" : "relative py-28 md:py-36 bg-background"}
      style={pinned ? ({ "--wwd-steps": n, "--wwd-step-vh": STEP_VH } as React.CSSProperties) : undefined}
      data-active={active}
    >
      {/* Moves each illustration's black point up to its own navy ground, so
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
      <div ref={stickyRef} className={pinned ? "wwd-sticky" : undefined}>
        <div className="container mx-auto px-6">
          {/* Statement on the left, a framed visual on the right. */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-20 items-stretch">
            <div className="min-w-0" data-wwd-col>
              {heading}

              <ul
                ref={listRef}
                className={pinned ? "space-y-1.5" : "space-y-2 max-lg:space-y-10"}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onFocus={() => setFocused(true)}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
              >
                {services.map((service, index) => {
                  const isActive = index === active;
                  return (
                    <li
                      key={service.titleKey}
                      data-wwd-item={index}
                      className={`wwd-li ${isActive ? "is-active" : ""} ${index < active ? "is-done" : ""}`}
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      {(() => {
                        const itemClass = `wwd-item group relative w-full text-left flex gap-5 rounded-xl px-5 transition-colors ${pinned ? "py-3.5" : "py-5"} ${
                          isActive ? "bg-accent/60" : isDesktop ? "hover:bg-accent/30" : ""
                        }`;
                        const number = (
                          <span className={`font-mono text-sm pt-1 tabular-nums transition-colors ${isActive ? "text-brand-accent" : "text-muted-foreground"}`}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        );
                        const titleClass = `block text-lg font-semibold mb-1.5 transition-colors ${isActive ? "text-foreground" : "text-foreground/80"}`;
                        const desc = (
                          // While held, only the service in view shows its
                          // description, so the list fits a laptop screen.
                          <span className="wwd-desc">
                            <span className={`block leading-relaxed transition-colors ${isActive || !isDesktop ? "text-foreground/80" : "text-muted-foreground"}`}>
                              {t(service.descKey)}
                            </span>
                          </span>
                        );
                        // Phones: nothing to press (every picture is already
                        // shown), so plain text with a real heading.
                        if (!isDesktop) {
                          return (
                            <div className={itemClass}>
                              {number}
                              <div>
                                <h3 className={titleClass}>{t(service.titleKey)}</h3>
                                {desc}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <>
                            {/* A heading may not sit inside a button, so the
                                service name is also a hidden heading for
                                screen readers' heading navigation. */}
                            <h3 className="sr-only">{t(service.titleKey)}</h3>
                            <button
                              type="button"
                              aria-pressed={isActive}
                              onClick={() => goTo(index)}
                              onMouseEnter={pinned ? undefined : () => setActive(index)}
                              onFocus={pinned ? undefined : () => setActive(index)}
                              className={itemClass}
                            >
                              {/* While held: how far through this service the scroll is. */}
                              {pinned && <span className="wwd-rail" aria-hidden="true"><span style={{ transform: `scaleY(var(--wwd-s${index}))` }} /></span>}
                              {number}
                              <span className="block">
                                <span className={titleClass}>{t(service.titleKey)}</span>
                                {desc}
                              </span>
                              {/* How long until the next service, while it is cycling. */}
                              {isActive && autoplay && (
                                <span key={active} className="wwd-progress" style={{ "--wwd-cycle": `${CYCLE_MS}ms` } as React.CSSProperties} />
                              )}
                            </button>
                          </>
                        );
                      })()}

                      {/* Phones: every service shows its picture, always — no
                          fold to open — and it drifts a little in its frame as
                          you scroll past. Decorative; the text carries it. */}
                      <div className="wwd-mini lg:hidden" aria-hidden="true">
                        <div className="section-ink wwd-panel wwd-panel--mini">
                          <Parallax className="wwd-mini-art" speed={0} phoneSpeed={0.07} max={22}>
                            <img src={service.art} alt="" decoding="async" loading="lazy" className="wwd-art-inline" />
                          </Parallax>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {pinned && (
                <p className="wwd-scrollhint" aria-hidden="true">
                  <span className="wwd-scrollhint-mouse" />
                  {t("whatWeDo.scrollHint")}
                </p>
              )}
            </div>

            {/* Desktop only. Decorative: the list carries the content, so the
                panel is hidden from assistive tech and its images have empty
                alt text. section-ink keeps it a dark panel in both themes. */}
            <div aria-hidden="true" className="section-ink wwd-panel wwd-stage relative hidden lg:block">
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
              {/* Which service, and how far through the three. */}
              <div className="wwd-steps">
                <span key={active} className="wwd-steps-n">{String(active + 1).padStart(2, "0")}</span>
                <span className="wwd-steps-of">/ {String(n).padStart(2, "0")}</span>
                <span className="wwd-steps-bars">
                  {services.map((s, k) => (
                    <span key={s.titleKey} className={k <= active ? "is-on" : undefined}>
                      <span style={pinned ? { transform: `scaleX(var(--wwd-s${k}))` } : undefined} />
                    </span>
                  ))}
                </span>
              </div>
              <div className="wwd-art-wrap absolute inset-x-0 top-0 bottom-20 sm:bottom-24 flex items-center justify-center">
                {services.map((service, index) => (
                  <img
                    key={service.titleKey}
                    src={service.art}
                    alt=""
                    decoding="async"
                    className={`wwd-art ${index === active ? "is-active" : index < active ? "is-past" : ""}`}
                  />
                ))}
              </div>
              {/* A scan line across the panel each time the service changes. */}
              <span key={`scan-${active}`} className="wwd-scan" />
              <XedaWordmark className="absolute left-1/2 -translate-x-1/2 bottom-9 sm:bottom-11 h-5 sm:h-6 w-auto text-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
