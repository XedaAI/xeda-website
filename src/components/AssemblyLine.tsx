import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useParallax } from "@/hooks/useParallax";

// The hero's argument as a production line, running left to right.
//
//   LEFT   what arrives — torn, crumpled and scribbled paper, forms crammed with
//          detail, and raw unstructured data: binary, half-written subject lines,
//          scan filenames. Tilted, uneven, travelling right.
//   CENTRE the XEDA mark. Everything is drawn into it.
//   RIGHT  what leaves — flat, squared, labelled: a booked invoice with its
//          account, an answered enquiry with its appointment, a clean sheet.
//
// Someone who knows nothing about software should be able to watch this once and
// say what we do. That is the whole design brief, and it is why the line runs in
// one direction and why the right-hand items carry real labels.
//
// Chaos fades INTO the mark and order emerges FROM it, as two streams meeting,
// rather than one element morphing — CSS cannot morph convincingly at this size,
// and two streams read more clearly anyway.

type Tier = "far" | "mid" | "near";
type InKind = "torn" | "crumpled" | "dense" | "scribble" | "invoice" | "bin" | "phrase";
type OutKind = "booked" | "answered" | "appointment" | "record" | "client" | "quoteA" | "quoteB";

interface InItem {
  /** Start, % of hero width from the left. */
  x: number;
  /** Start, % of hero height. */
  y: number;
  kind: InKind;
  tier: Tier;
  r0: number;
  r1: number;
  a: number;
  d: number;
  dl: number;
  mobile?: boolean;
}

interface OutItem {
  /** Lane to settle into by the right edge, % of hero height. */
  y: number;
  kind: OutKind;
  tier: Tier;
  a: number;
  d: number;
  dl: number;
  mobile?: boolean;
}

// Everything starts left of centre and lands right of it. Vertical spread stays
// in the upper band, where the mark sits — the headline owns the middle.
const IN_ITEMS: InItem[] = [
  { x: 1, y: 6, kind: "torn", tier: "mid", r0: -13, r1: 4, a: 0.42, d: 12, dl: -1, mobile: true },
  { x: 9, y: 26, kind: "invoice", tier: "near", r0: 8, r1: -3, a: 0.52, d: 10.5, dl: -4.5, mobile: true },
  { x: 3, y: 42, kind: "crumpled", tier: "mid", r0: -17, r1: 5, a: 0.4, d: 13.5, dl: -8, mobile: true },
  { x: 17, y: 12, kind: "dense", tier: "far", r0: 10, r1: -2, a: 0.3, d: 15, dl: -6 },
  { x: 14, y: 52, kind: "scribble", tier: "far", r0: -7, r1: 3, a: 0.28, d: 14, dl: -11 },
  { x: 24, y: 33, kind: "torn", tier: "far", r0: 12, r1: -4, a: 0.26, d: 13, dl: -2.5 },
  // Raw data — no paper, just characters that have not been made sense of yet.
  { x: 2, y: 18, kind: "bin", tier: "far", r0: 0, r1: 0, a: 0.5, d: 11, dl: -3, mobile: true },
  { x: 12, y: 3, kind: "phrase", tier: "mid", r0: 0, r1: 0, a: 0.55, d: 12.5, dl: -7 },
  { x: 6, y: 58, kind: "phrase", tier: "mid", r0: 0, r1: 0, a: 0.5, d: 13, dl: -9.5, mobile: true },
  { x: 20, y: 46, kind: "bin", tier: "far", r0: 0, r1: 0, a: 0.44, d: 10, dl: -5.5 },
  { x: 16, y: 63, kind: "phrase", tier: "far", r0: 0, r1: 0, a: 0.42, d: 14.5, dl: -12 },
  { x: 26, y: 20, kind: "bin", tier: "mid", r0: 0, r1: 0, a: 0.4, d: 11.5, dl: -8.5 },
];

const OUT_ITEMS: OutItem[] = [
  { y: 10, kind: "booked", tier: "near", a: 0.92, d: 11, dl: -2, mobile: true },
  { y: 27, kind: "record", tier: "near", a: 0.9, d: 12, dl: -6.5, mobile: true },
  { y: 44, kind: "answered", tier: "mid", a: 0.88, d: 11.5, dl: -9, mobile: true },
  { y: 60, kind: "appointment", tier: "mid", a: 0.85, d: 13, dl: -4 },
  { y: 17, kind: "quoteA", tier: "mid", a: 0.8, d: 14, dl: -11.5 },
  { y: 52, kind: "client", tier: "far", a: 0.72, d: 12.5, dl: -7.5 },
  { y: 35, kind: "quoteB", tier: "far", a: 0.7, d: 15, dl: -13 },
];

const TIERS: Array<{ tier: Tier; scroll: number; mouse: number }> = [
  { tier: "far", scroll: 0.07, mouse: 4 },
  { tier: "mid", scroll: 0.15, mouse: 9 },
  { tier: "near", scroll: 0.24, mouse: 15 },
];

const COPY = {
  de: {
    capIn: "Eingang · ungeordnet",
    capOut: "Ausgang · geprüft & gebucht",
    receipt: "Beleg",
    note: "Notiz",
    form: "Formular",
    invoice: "Rechnung",
    sum: "Summe",
    phrases: ["re: rechnung?? anbei", "scan_0043.pdf", "AW: AW: Beleg fehlt", "Bitte prüfen — eilig"],
    booked: "Gebucht · DATEV",
    answered: "Beantwortet · Kalender",
    appointment: "Termin · 14:30",
    recordKey: "Rechnung",
    recordVal: "1.240,00 €",
    accountKey: "Konto",
    accountVal: "SKR03 4400",
    clientKey: "Mandant",
    clientVal: "Müller GmbH",
    dueKey: "Fällig",
    dueVal: "14.10.",
    quoteA: "Gönnen Sie sich Ruhe. Die KI arbeitet.",
    quoteB: "Papier rein. Entscheidungen raus.",
  },
  en: {
    capIn: "Incoming · unsorted",
    capOut: "Outgoing · checked & booked",
    receipt: "Receipt",
    note: "Note",
    form: "Form",
    invoice: "Invoice",
    sum: "Total",
    phrases: ["re: invoice?? attached", "scan_0043.pdf", "FW: FW: receipt missing", "Please check — urgent"],
    booked: "Booked · DATEV",
    answered: "Answered · Calendar",
    appointment: "Appointment · 14:30",
    recordKey: "Invoice",
    recordVal: "1,240.00 €",
    accountKey: "Account",
    accountVal: "SKR03 4400",
    clientKey: "Client",
    clientVal: "Müller GmbH",
    dueKey: "Due",
    dueVal: "14 Oct",
    quoteA: "Get some rest. Let the AI work.",
    quoteB: "Paperwork in. Decisions out.",
  },
} as const;

type Copy = (typeof COPY)["de"];

const Check = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 96%)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Scribble = () => (
  <svg viewBox="0 0 80 34" className="al-scribble" width="100%" height="22" aria-hidden="true">
    <path d="M4 10c8-7 13 6 21 0s12 7 20 1 13 5 21-1" />
    <path d="M4 24c10-5 16 4 26 0s16 4 26-2" />
  </svg>
);

function InBody({ kind, L, phrase }: { kind: InKind; L: Copy; phrase: string }) {
  switch (kind) {
    case "torn":
      return (
        <>
          <div className="al-hd" />
          <span className="al-tag">{L.receipt}</span>
          <div className="al-ln" />
          <div className="al-ln al-ln--s" />
        </>
      );
    case "invoice":
      return (
        <>
          <div className="al-hd" />
          <span className="al-tag">{L.invoice}</span>
          <div className="al-ln" />
          <div className="al-ln" />
          <div className="al-ln al-ln--s" />
          <div className="al-foot">
            <span className="al-tag">{L.sum}</span>
            <div className="al-amt" />
          </div>
        </>
      );
    case "crumpled":
      return (
        <>
          <span className="al-crease" style={{ top: "28%", transform: "rotate(-7deg)" }} />
          <span className="al-crease" style={{ top: "62%", transform: "rotate(5deg)" }} />
          <div className="al-hd" />
          <span className="al-tag">{L.note}</span>
          <Scribble />
        </>
      );
    case "dense":
      return (
        <>
          <div className="al-hd" />
          <span className="al-tag">{L.form}</span>
          <div className="al-dense">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className={`al-ln${i % 3 === 2 ? " al-ln--s" : ""}`} />
            ))}
          </div>
        </>
      );
    case "scribble":
      return (
        <>
          <div className="al-hd" />
          <Scribble />
          <Scribble />
        </>
      );
    default:
      return <span>{phrase}</span>;
  }
}

function OutBody({ kind, L }: { kind: OutKind; L: Copy }) {
  switch (kind) {
    case "booked":
      return (
        <span className="al-chip">
          <span className="al-badge"><Check /></span>
          {L.booked}
        </span>
      );
    case "answered":
      return (
        <span className="al-chip">
          <span className="al-badge"><Check /></span>
          {L.answered}
        </span>
      );
    case "appointment":
      return <span className="al-chip">{L.appointment}</span>;
    case "record":
      return (
        <div className="al-card">
          <div className="al-row"><span className="al-key">{L.recordKey}</span><span className="al-val">{L.recordVal}</span></div>
          <div className="al-row"><span className="al-key">{L.accountKey}</span><span className="al-val">{L.accountVal}</span></div>
        </div>
      );
    case "client":
      return (
        <div className="al-card">
          <div className="al-row"><span className="al-key">{L.clientKey}</span><span className="al-val">{L.clientVal}</span></div>
          <div className="al-row"><span className="al-key">{L.dueKey}</span><span className="al-val">{L.dueVal}</span></div>
        </div>
      );
    default:
      return (
        <div className="al-paper al-paper--md">
          <div className="al-hd" />
          <div className="al-quote">{kind === "quoteA" ? L.quoteA : L.quoteB}</div>
          <div className="al-ln al-ln--s" />
          <div className="al-foot">
            <span className="al-badge"><Check /></span>
          </div>
        </div>
      );
  }
}

const PAPER_SIZE: Partial<Record<InKind, string>> = {
  torn: "al-paper--md",
  invoice: "al-paper--lg",
  crumpled: "al-paper--md",
  dense: "al-paper--sm",
  scribble: "al-paper--sm",
};

function Layer({ scroll, mouse, children }: { scroll: number; mouse: number; children: ReactNode }) {
  const scrollRef = useParallax<HTMLDivElement>(scroll);
  const mouseRef = useMouseParallax<HTMLDivElement>(mouse);
  return (
    <div ref={scrollRef} className="al-layer">
      <div ref={mouseRef} className="al-layer">{children}</div>
    </div>
  );
}

interface AssemblyLineProps {
  /** The element both streams meet at — the XEDA mark in the hero. */
  coreRef: RefObject<HTMLElement>;
  className?: string;
}

const AssemblyLine = ({ coreRef, className = "" }: AssemblyLineProps) => {
  const { language } = useLanguage();
  const L = COPY[language === "de" ? "de" : "en"];
  const rootRef = useRef<HTMLDivElement>(null);

  // Measure once per size change: inbound items need a vector to the mark,
  // outbound items a vector from the mark to their lane at the right edge. Doing
  // it in JS is what keeps the line aimed correctly at any viewport width.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const core = coreRef.current;
      if (!core) return;
      const rootRect = root.getBoundingClientRect();
      const coreRect = core.getBoundingClientRect();
      const W = rootRect.width;
      const H = rootRect.height;
      const cx = coreRect.left - rootRect.left + coreRect.width / 2;
      const cy = coreRect.top - rootRect.top + coreRect.height / 2;
      root.style.setProperty("--core-x", `${cx}px`);
      root.style.setProperty("--core-y", `${cy}px`);

      root.querySelectorAll<HTMLElement>(".al-in").forEach((el) => {
        const r = el.getBoundingClientRect();
        const ex = r.left - rootRect.left + r.width / 2;
        const ey = r.top - rootRect.top + r.height / 2;
        el.style.setProperty("--dx", `${cx - ex}px`);
        el.style.setProperty("--dy", `${cy - ey}px`);
      });

      root.querySelectorAll<HTMLElement>(".al-out").forEach((el) => {
        const lane = Number(el.dataset.lane) || 0;
        el.style.setProperty("--dx", `${W + 170 - cx}px`);
        el.style.setProperty("--dy", `${(lane / 100) * H - cy}px`);
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    if (coreRef.current) ro.observe(coreRef.current);

    const io = new IntersectionObserver(([e]) => root.classList.toggle("is-paused", !e.isIntersecting), {
      threshold: 0,
    });
    io.observe(root);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [coreRef]);

  return (
    <div ref={rootRef} className={`al-field ${className}`} aria-hidden="true">
      {TIERS.map(({ tier, scroll, mouse }) => (
        <Layer key={tier} scroll={scroll} mouse={mouse}>
          {IN_ITEMS.map((it, i) => {
            if (it.tier !== tier) return null;
            const isRaw = it.kind === "bin" || it.kind === "phrase";
            const phrase =
              it.kind === "bin"
                ? i % 2 === 0
                  ? "01001101 0110 1011"
                  : "1010 0111 0010 1101"
                : L.phrases[i % L.phrases.length];
            return (
              <div
                key={`in-${i}`}
                className={`al-item al-in ${it.mobile ? "" : "al-item--desk"} ${
                  isRaw ? `al-raw${it.kind === "bin" ? " al-raw--bin" : ""}` : `al-paper ${PAPER_SIZE[it.kind]} ${
                    it.kind === "torn" || it.kind === "invoice" ? "al-torn" : ""
                  } ${it.kind === "crumpled" ? "al-crumple" : ""}`
                }`}
                style={
                  {
                    left: `${it.x}%`,
                    top: `${it.y}%`,
                    "--r0": `${it.r0}deg`,
                    "--r1": `${it.r1}deg`,
                    "--a": it.a,
                    "--d": `${it.d}s`,
                    "--dl": `${it.dl}s`,
                  } as CSSProperties
                }
              >
                <InBody kind={it.kind} L={L} phrase={phrase} />
              </div>
            );
          })}

          {OUT_ITEMS.map((it, i) =>
            it.tier !== tier ? null : (
              <div
                key={`out-${i}`}
                data-lane={it.y}
                className={`al-item al-out ${it.mobile ? "" : "al-item--desk"}`}
                style={
                  {
                    left: "var(--core-x, 50%)",
                    top: "var(--core-y, 30%)",
                    "--a": it.a,
                    "--d": `${it.d}s`,
                    "--dl": `${it.dl}s`,
                  } as CSSProperties
                }
              >
                <OutBody kind={it.kind} L={L} />
              </div>
            )
          )}
        </Layer>
      ))}

      <div className="al-pulse" />
      <div className="al-pulse al-pulse--2" />

      {/* Names the two ends, so the direction of the line is never ambiguous. */}
      <span className="al-caption al-caption--in">{L.capIn}</span>
      <span className="al-caption al-caption--out">{L.capOut}</span>
    </div>
  );
};

export default AssemblyLine;
