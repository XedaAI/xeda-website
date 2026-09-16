import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useParallax } from "@/hooks/useParallax";

// The hero's argument as a production line, running left to right.
//
//   LEFT   raw, unstructured input and nothing else — binary, hex, half-written
//          subject lines, scan filenames, a stray CSV header. Deliberately no
//          paper and no container: the point is that none of it has a shape yet.
//   CENTRE the XEDA mark. Everything is drawn into it.
//   RIGHT  structured output — every item boxed and labelled: an invoice with
//          its account, "Gebucht · DATEV", an appointment, a client record.
//
// The contrast is the message: loose characters floating on the left, contained
// and named on the right. Someone who knows nothing about software should be
// able to watch this once and say what we do.
//
// Chaos fades INTO the mark and order emerges FROM it, as two streams meeting,
// rather than one element morphing — CSS cannot morph convincingly at this size,
// and two streams read more clearly anyway.

type Tier = "far" | "mid" | "near";
/** bin = machine noise (binary, hex, magic bytes); phrase = human fragments. */
type InKind = "bin" | "phrase";
type OutKind = "booked" | "answered" | "appointment" | "record" | "client" | "quoteA" | "quoteB";

interface InItem {
  /** Start, % of hero width from the left. */
  x: number;
  /** Start, % of hero height. */
  y: number;
  kind: InKind;
  /** Literal, language-neutral text (binary, hex, filenames). */
  text?: string;
  /** Index into the localised phrase list, for anything a person typed. */
  phrase?: number;
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

// Each item carries its own text rather than deriving it from its index — an
// earlier version picked by `i % list.length`, which silently dropped one phrase
// and printed the same binary string twice.
const IN_ITEMS: InItem[] = [
  { x: 1, y: 8, kind: "bin", text: "01001101 0110 1011", tier: "mid", r0: -4, r1: 2, a: 0.58, d: 11.5, dl: -1, mobile: true },
  { x: 11, y: 2, kind: "phrase", phrase: 0, tier: "mid", r0: 3, r1: -1, a: 0.6, d: 12.5, dl: -6.5 },
  { x: 3, y: 20, kind: "phrase", phrase: 1, tier: "near", r0: -6, r1: 3, a: 0.66, d: 10.5, dl: -3.5, mobile: true },
  { x: 19, y: 13, kind: "bin", text: "0110 1001 1100 0101", tier: "far", r0: 5, r1: -2, a: 0.42, d: 14, dl: -9 },
  { x: 7, y: 32, kind: "bin", text: "89 50 4E 47 0D 0A", tier: "far", r0: -3, r1: 1, a: 0.44, d: 13, dl: -11.5 },
  { x: 24, y: 26, kind: "phrase", phrase: 2, tier: "mid", r0: 4, r1: -2, a: 0.54, d: 12, dl: -5 },
  { x: 2, y: 44, kind: "phrase", phrase: 3, tier: "mid", r0: -5, r1: 2, a: 0.56, d: 13.5, dl: -8, mobile: true },
  { x: 15, y: 39, kind: "bin", text: "%PDF-1.4", tier: "near", r0: 6, r1: -3, a: 0.62, d: 11, dl: -2 },
  { x: 27, y: 46, kind: "bin", text: "1010 0111 0010 1101", tier: "far", r0: -4, r1: 2, a: 0.4, d: 15, dl: -12.5 },
  { x: 9, y: 55, kind: "phrase", phrase: 4, tier: "far", r0: 3, r1: -1, a: 0.46, d: 14.5, dl: -7 },
  { x: 20, y: 60, kind: "bin", text: "datum;betrag;konto", tier: "mid", r0: -6, r1: 3, a: 0.52, d: 12.8, dl: -10.5, mobile: true },
  { x: 4, y: 66, kind: "phrase", phrase: 5, tier: "far", r0: 5, r1: -2, a: 0.42, d: 13.8, dl: -4 },
  { x: 29, y: 6, kind: "bin", text: "IMG_2291.jpeg", tier: "far", r0: -3, r1: 1, a: 0.38, d: 15.5, dl: -13.5 },
  { x: 13, y: 71, kind: "bin", text: "beleg_final_v2.pdf", tier: "mid", r0: 4, r1: -2, a: 0.48, d: 12.2, dl: -9.5 },
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
    phrases: [
      "re: rechnung?? anbei",
      "AW: AW: Beleg fehlt",
      "Bitte prüfen — eilig",
      "kein Datum?",
      "Betrag unklar…",
      "Rechnung 4711?",
    ],
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
    phrases: [
      "re: invoice?? attached",
      "FW: FW: receipt missing",
      "Please check — urgent",
      "no date?",
      "amount unclear…",
      "Invoice 4711?",
    ],
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
          {IN_ITEMS.map((it, i) =>
            it.tier !== tier ? null : (
              <div
                key={`in-${i}`}
                className={`al-item al-in al-raw ${it.kind === "bin" ? "al-raw--bin" : ""} ${
                  it.mobile ? "" : "al-item--desk"
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
                {it.text ?? L.phrases[it.phrase ?? 0]}
              </div>
            )
          )}

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
