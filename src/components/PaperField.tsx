import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useParallax } from "@/hooks/useParallax";

// Hero backdrop: the front-desk story, rendered. Invoices, receipts, forms and
// mail stream in from the edges — tilted, scattered — get pulled into the XEDA
// mark (the AI core), and land in the bottom corners as tidy, checked stacks:
// booked in DATEV, answered in the calendar. Chaos at the edges, order in the
// corners, and the centre stays clear so the headline stays legible.
//
// Three depth tiers (far / mid / near) each sit in their own layer with their
// own scroll- and mouse-parallax strength, so the field reads as real depth.
// Each sheet's flight vector is measured in JS against the live mark position,
// so it converges on the core at any viewport size. Purely decorative
// (aria-hidden); motion pauses off-screen and is static under reduced motion.

type Tier = "far" | "mid" | "near";
type Kind = "invoice" | "receipt" | "form" | "mail";
type Side = "left" | "right";

interface Sheet {
  side: Side;
  /** Horizontal inset from `side`, % of hero width. */
  x: number;
  /** Top, % of hero height (may be negative: enters from above). */
  top: number;
  tier: Tier;
  kind: Kind;
  r0: number;
  r1: number;
  a: number;
  d: number;
  dl: number;
  /** Also shown on small screens (the rest are desktop-only). */
  mobile?: boolean;
  /** Index into QUOTES — a short brand line printed on the sheet (mid/near only). */
  q?: number;
}

// Positions are % of the hero, derived from the approved 1440×1080 design frame.
const SHEETS: Sheet[] = [
  // left stream (mid/near sheets carry a brand line — slightly brighter so it reads)
  { side: "left", x: 2.8, top: 18.5, tier: "mid", kind: "invoice", r0: -14, r1: 4, a: 0.36, d: 13, dl: -2, mobile: true, q: 0 },
  { side: "left", x: 13.2, top: 5.6, tier: "far", kind: "receipt", r0: 9, r1: -3, a: 0.2, d: 16, dl: -9, mobile: true },
  { side: "left", x: 6.3, top: 38.9, tier: "near", kind: "form", r0: -7, r1: 3, a: 0.5, d: 11, dl: -5, q: 1 },
  { side: "left", x: 22.2, top: 24.1, tier: "mid", kind: "invoice", r0: 12, r1: 0, a: 0.36, d: 12, dl: -7, q: 2 },
  { side: "left", x: 2.1, top: 64.8, tier: "mid", kind: "receipt", r0: -18, r1: 5, a: 0.34, d: 14, dl: -11, mobile: true, q: 3 },
  { side: "left", x: 18.1, top: 57.4, tier: "far", kind: "form", r0: 6, r1: -2, a: 0.18, d: 15, dl: -3 },
  { side: "left", x: 30.6, top: 11.1, tier: "far", kind: "invoice", r0: -5, r1: 2, a: 0.22, d: 10, dl: -6 },
  { side: "left", x: 12.5, top: 81.5, tier: "near", kind: "invoice", r0: 8, r1: -4, a: 0.44, d: 13, dl: -1, mobile: true, q: 4 },
  { side: "left", x: 26.4, top: 72.2, tier: "far", kind: "receipt", r0: 10, r1: -2, a: 0.16, d: 15, dl: -8 },
  // right stream
  { side: "right", x: 2.8, top: 18.5, tier: "mid", kind: "invoice", r0: 13, r1: -4, a: 0.36, d: 13, dl: -8, mobile: true, q: 5 },
  { side: "right", x: 13.2, top: 5.6, tier: "far", kind: "receipt", r0: -8, r1: 3, a: 0.2, d: 16, dl: -4, mobile: true },
  { side: "right", x: 6.3, top: 38.9, tier: "near", kind: "form", r0: 7, r1: -3, a: 0.5, d: 11, dl: -10, q: 6 },
  { side: "right", x: 22.2, top: 24.1, tier: "mid", kind: "invoice", r0: -11, r1: 0, a: 0.36, d: 12, dl: -2, q: 7 },
  { side: "right", x: 2.1, top: 64.8, tier: "mid", kind: "receipt", r0: 16, r1: -5, a: 0.34, d: 14, dl: -6, mobile: true, q: 8 },
  { side: "right", x: 18.1, top: 57.4, tier: "far", kind: "form", r0: -6, r1: 2, a: 0.18, d: 15, dl: -12 },
  { side: "right", x: 30.6, top: 11.1, tier: "far", kind: "invoice", r0: 5, r1: -2, a: 0.22, d: 10, dl: -1 },
  { side: "right", x: 12.5, top: 81.5, tier: "near", kind: "invoice", r0: -9, r1: 4, a: 0.44, d: 13, dl: -7, mobile: true, q: 9 },
  { side: "right", x: 26.4, top: 72.2, tier: "far", kind: "receipt", r0: -10, r1: 2, a: 0.16, d: 15, dl: -3 },
  // from above
  { side: "left", x: 38.9, top: -12, tier: "far", kind: "mail", r0: 4, r1: 0, a: 0.2, d: 12, dl: -4 },
  { side: "left", x: 55.6, top: -10.2, tier: "far", kind: "mail", r0: -4, r1: 0, a: 0.2, d: 12, dl: -9 },
];

// Must match the sizes in index.css (.paper-sheet--* and the small-screen override).
const SIZE: Record<Tier, [number, number]> = { far: [84, 108], mid: [112, 144], near: [140, 180] };
const SIZE_SMALL: Record<Tier, [number, number]> = { far: [56, 72], mid: [76, 98], near: [96, 124] };

const TIERS: Array<{ tier: Tier; scroll: number; mouse: number }> = [
  { tier: "far", scroll: 0.08, mouse: 4 },
  { tier: "mid", scroll: 0.16, mouse: 8 },
  { tier: "near", scroll: 0.26, mouse: 14 },
];

const LABELS = {
  de: {
    invoice: "Rechnung", receipt: "Beleg", form: "Formular", mail: "E-Mail",
    sum: "Summe", sign: "Unterschrift",
    stackATag: "Rechnung · Gebucht", stackA: "Gebucht · DATEV", stackAQuote: "Gebucht. Ohne Abtippen.",
    stackBTag: "Anfrage · Beantwortet", stackB: "Beantwortet · Kalender", stackBQuote: "Beantwortet. Ohne Warteschleife.",
  },
  en: {
    invoice: "Invoice", receipt: "Receipt", form: "Form", mail: "E-mail",
    sum: "Total", sign: "Signature",
    stackATag: "Invoice · Booked", stackA: "Booked · DATEV", stackAQuote: "Booked. No typing.",
    stackBTag: "Request · Answered", stackB: "Answered · Calendar", stackBQuote: "Answered. No hold music.",
  },
} as const;

// Short brand lines printed on the documents — the philosophy, glimpsed as the
// paper drifts past: the repetitive work is the machine's, the thinking is yours.
const QUOTES = {
  de: [
    "Gönnen Sie sich Ruhe. Die KI arbeitet.",
    "Ihr Team denkt. Die KI tippt.",
    "Die Routine erledigt sich selbst.",
    "Papier rein. Entscheidungen raus.",
    "20 Stunden pro Woche – zurück an Sie.",
    "Kein Hype. Nur Systeme, die laufen.",
    "Jeder Beleg findet seinen Platz.",
    "KI in den Tools, die Sie schon nutzen.",
    "Gebaut und betrieben – im DACH-Raum.",
    "Mandanten im Fokus, nicht das Abtippen.",
  ],
  en: [
    "Get some rest. Let the AI work.",
    "Your team thinks. The AI types.",
    "The busywork does itself.",
    "Paperwork in. Decisions out.",
    "20 hours a week — back to you.",
    "No hype. Just systems that work.",
    "Every receipt finds its place.",
    "AI inside the tools you already use.",
    "Built and run for you — in DACH.",
    "Focus on clients, not on typing.",
  ],
} as const;

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220 12% 8%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function SheetBody({ kind, tier, quote, L }: { kind: Kind; tier: Tier; quote?: string; L: (typeof LABELS)["de"] }) {
  // A sheet carrying a brand line: header, the line, one document detail, total.
  if (quote) {
    return (
      <>
        <div className="pf-hd" /><span className="pf-tag">{L[kind]}</span>
        <div className="pf-quote">{quote}</div>
        {kind === "form" ? (
          <div className="pf-row"><span className="pf-chk" /><div className="pf-ln" /></div>
        ) : kind === "receipt" ? (
          <div className="pf-tear" />
        ) : (
          <div className="pf-ln pf-ln--s" />
        )}
        <div className="pf-tot"><span className="pf-tag">{kind === "form" ? L.sign : L.sum}</span><div className="pf-b" /></div>
        {kind === "invoice" && tier !== "far" && <div className="pf-stamp" />}
      </>
    );
  }
  switch (kind) {
    case "invoice":
      return (
        <>
          <div className="pf-hd" /><span className="pf-tag">{L.invoice}</span>
          <div className="pf-ln" /><div className="pf-ln" /><div className="pf-ln pf-ln--s" />{tier !== "far" && <div className="pf-ln" />}
          <div className="pf-tot"><span className="pf-tag">{L.sum}</span><div className="pf-b" /></div>
          {tier !== "far" && <div className="pf-stamp" />}
        </>
      );
    case "receipt":
      return (
        <>
          <div className="pf-hd" /><span className="pf-tag">{L.receipt}</span>
          <div className="pf-ln" /><div className="pf-ln pf-ln--s" /><div className="pf-tear" /><div className="pf-ln pf-ln--xs" />
        </>
      );
    case "form":
      return (
        <>
          <div className="pf-hd" /><span className="pf-tag">{L.form}</span>
          <div className="pf-row"><span className="pf-chk" /><div className="pf-ln" /></div>
          <div className="pf-row"><span className="pf-chk" /><div className="pf-ln pf-ln--s" /></div>
          {tier !== "far" && <div className="pf-row"><span className="pf-chk" /><div className="pf-ln" /></div>}
          {tier === "near" && <div className="pf-tot"><span className="pf-tag">{L.sign}</span><div className="pf-b" /></div>}
        </>
      );
    case "mail":
      return (
        <>
          <div className="pf-hd" /><span className="pf-tag">{L.mail}</span>
          <div className="pf-ln" /><div className="pf-ln" /><div className="pf-ln pf-ln--s" />
        </>
      );
  }
}

function Layer({ scroll, mouse, children }: { scroll: number; mouse: number; children: ReactNode }) {
  const scrollRef = useParallax<HTMLDivElement>(scroll);
  const mouseRef = useMouseParallax<HTMLDivElement>(mouse);
  return (
    <div ref={scrollRef} className="paper-layer">
      <div ref={mouseRef} className="paper-layer">{children}</div>
    </div>
  );
}

interface PaperFieldProps {
  /** The element the paper converges on — the XEDA mark in the hero. */
  coreRef: RefObject<HTMLElement>;
  className?: string;
}

const PaperField = ({ coreRef, className = "" }: PaperFieldProps) => {
  const { language } = useLanguage();
  const lang = language === "de" ? "de" : "en";
  const L = LABELS[lang];
  const Q = QUOTES[lang];
  const rootRef = useRef<HTMLDivElement>(null);

  // Measure flight vectors: from each sheet's resting centre to the mark's
  // centre, in px, so the paper always converges on the core wherever the mark
  // ends up at the current viewport size. Re-measured on every resize.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const core = coreRef.current;
      if (!core) return;
      const rootRect = root.getBoundingClientRect();
      const coreRect = core.getBoundingClientRect();
      const W = rootRect.width, H = rootRect.height;
      const cx = coreRect.left - rootRect.left + coreRect.width / 2;
      const cy = coreRect.top - rootRect.top + coreRect.height / 2;
      root.style.setProperty("--core-x", `${cx}px`);
      root.style.setProperty("--core-y", `${cy}px`);
      const small = window.matchMedia("(max-width: 767px)").matches;
      const sizes = small ? SIZE_SMALL : SIZE;
      root.querySelectorAll<HTMLElement>(".paper-sheet").forEach((el) => {
        const s = SHEETS[Number(el.dataset.i)];
        const [w, h] = sizes[s.tier];
        const sx = s.side === "left" ? (s.x / 100) * W + w / 2 : W - (s.x / 100) * W - w / 2;
        const sy = (s.top / 100) * H + h / 2;
        el.style.setProperty("--dx", `${cx - sx}px`);
        el.style.setProperty("--dy", `${cy - sy}px`);
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    if (coreRef.current) ro.observe(coreRef.current);

    // Don't burn frames animating paper nobody can see.
    const io = new IntersectionObserver(([e]) => root.classList.toggle("is-paused", !e.isIntersecting), { threshold: 0 });
    io.observe(root);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [coreRef]);

  return (
    <div ref={rootRef} className={`paper-field ${className}`} aria-hidden="true">
      {TIERS.map(({ tier, scroll, mouse }) => (
        <Layer key={tier} scroll={scroll} mouse={mouse}>
          {SHEETS.map((s, i) =>
            s.tier !== tier ? null : (
              <div
                key={i}
                data-i={i}
                className={`paper-sheet paper-sheet--${tier} ${s.mobile ? "" : "paper-sheet--desk"}`}
                style={
                  {
                    [s.side]: `${s.x}%`,
                    top: `${s.top}%`,
                    "--r0": `${s.r0}deg`,
                    "--r1": `${s.r1}deg`,
                    "--a": s.a,
                    "--d": `${s.d}s`,
                    "--dl": `${s.dl}s`,
                  } as CSSProperties
                }
              >
                <SheetBody kind={s.kind} tier={tier} quote={s.q !== undefined ? Q[s.q] : undefined} L={L} />
              </div>
            )
          )}
          {tier === "near" && (
            <>
              <div className="paper-stack paper-stack--left" style={{ "--dl": "-2s" } as CSSProperties}>
                <div className="pf-sh" /><div className="pf-sh" />
                <div className="pf-sh">
                  <div className="pf-hd" style={{ width: "48%" }} /><span className="pf-tag">{L.stackATag}</span>
                  <div className="pf-quote">{L.stackAQuote}</div>
                  <div className="pf-ln" /><div className="pf-ln pf-ln--s" />
                  <div className="pf-tot"><span className="pf-tag">SKR03 · 4400</span><div className="pf-b" /></div>
                  <div className="pf-badge"><Check /></div>
                </div>
                <div className="pf-lbl">{L.stackA}</div>
              </div>
              <div className="paper-stack paper-stack--right" style={{ "--dl": "-6.5s" } as CSSProperties}>
                <div className="pf-sh" /><div className="pf-sh" />
                <div className="pf-sh">
                  <div className="pf-hd" style={{ width: "60%" }} /><span className="pf-tag">{L.stackBTag}</span>
                  <div className="pf-quote">{L.stackBQuote}</div>
                  <div className="pf-ln" /><div className="pf-ln pf-ln--s" />
                  <div className="pf-tot"><span className="pf-tag">14:30</span><div className="pf-b" /></div>
                  <div className="pf-badge"><Check /></div>
                </div>
                <div className="pf-lbl">{L.stackB}</div>
              </div>
            </>
          )}
        </Layer>
      ))}

      {/* processing pulses radiating from the core */}
      <div className="paper-pulse" />
      <div className="paper-pulse paper-pulse--2" />
    </div>
  );
};

export default PaperField;
