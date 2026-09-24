import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import PipeDust from "@/components/PipeDust";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useParallax } from "@/hooks/useParallax";

// The hero's argument as a pipe, running left to right through the mark.
//
//   LEFT    raw, unstructured input and nothing else — binary, hex, half-written
//           subject lines, scan filenames, a stray CSV header. Deliberately no
//           paper and no container: none of it has a shape yet. All of it
//           converges on ONE opening, along drawn guides, and shrinks away INTO
//           it, so it visibly goes in at a single point.
//   BORE    the same material, travelling inside the pipe. Up to the mark it is
//           still crooked and off-axis; at the mark it snaps straight and onto a
//           lane. That one second is the promise, shown rather than claimed.
//   RIGHT   out of the outlet, every item boxed and labelled and riding its lane.
//   CENTRE  the mark, as a collar the pipe runs THROUGH. Turned 58° about the
//           vertical, its plane crosses the pipe instead of lying along it —
//           the difference between "beside" and "through". Its far half is
//           drawn under the pipe and its near half over it, so the run is
//           genuinely threaded rather than merely overlapped.
//
// The pipe tapers away to the right, so the run has depth: the intake is near and
// wide, the outlet further off and narrower. Someone who knows nothing about
// software should be able to watch this once and say what we do.
//
// The pipe is built from clip-path trapezoids rather than SVG so it stretches
// with the viewport without distorting stroke widths or the two mouths.

type Tier = "far" | "mid" | "near";
/** bin = machine noise (binary, hex, magic bytes); phrase = human fragments. */
type InKind = "bin" | "phrase";
type OutKind = "booked" | "answered" | "appointment" | "record" | "client" | "quoteA" | "quoteB";

interface InItem {
  /** Start, % of hero width from the left. Everything stays left of the intake. */
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
  a: number;
  d: number;
  dl: number;
  mobile?: boolean;
}

/** A light streak down the bore. Light, not data — hence its own timing. */
interface RayItem {
  /** Start offset from the pipe axis at the intake, px. */
  y0: number;
  w: number;
  h: number;
  a: number;
  d: number;
  dl: number;
  mobile?: boolean;
}

interface BoreItem {
  /** Start offset from the pipe axis at the intake, px. */
  y0: number;
  /** Lane to snap onto at the mark, px from the axis. */
  lane: number;
  kind: InKind;
  text?: string;
  phrase?: number;
  r0: number;
  a: number;
  d: number;
  dl: number;
  mobile?: boolean;
}

interface OutItem {
  /** Lane index, 0–4 — top to bottom. Sets the angle it leaves the outlet on. */
  lane: number;
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
  { x: 1, y: 10, kind: "bin", text: "01001101 0110 1011", tier: "mid", r0: -4, a: 0.58, d: 11.5, dl: -1, mobile: true },
  { x: 8, y: 3, kind: "phrase", phrase: 0, tier: "mid", r0: 3, a: 0.6, d: 12.5, dl: -6.5 },
  { x: 2, y: 22, kind: "phrase", phrase: 1, tier: "near", r0: -6, a: 0.66, d: 10.5, dl: -3.5, mobile: true },
  { x: 13, y: 15, kind: "bin", text: "0110 1001 1100 0101", tier: "far", r0: 5, a: 0.42, d: 14, dl: -9 },
  { x: 5, y: 36, kind: "bin", text: "89 50 4E 47 0D 0A", tier: "far", r0: -3, a: 0.44, d: 13, dl: -11.5 },
  { x: 15, y: 30, kind: "phrase", phrase: 2, tier: "mid", r0: 4, a: 0.54, d: 12, dl: -5 },
  { x: 1, y: 50, kind: "phrase", phrase: 3, tier: "mid", r0: -5, a: 0.56, d: 13.5, dl: -8, mobile: true },
  { x: 10, y: 44, kind: "bin", text: "%PDF-1.4", tier: "near", r0: 6, a: 0.62, d: 11, dl: -2 },
  { x: 17, y: 53, kind: "bin", text: "1010 0111 0010 1101", tier: "far", r0: -4, a: 0.4, d: 15, dl: -12.5 },
  { x: 6, y: 63, kind: "phrase", phrase: 4, tier: "far", r0: 3, a: 0.46, d: 14.5, dl: -7 },
  { x: 13, y: 69, kind: "bin", text: "datum;betrag;konto", tier: "mid", r0: -6, a: 0.52, d: 12.8, dl: -10.5, mobile: true },
  { x: 2, y: 78, kind: "phrase", phrase: 5, tier: "far", r0: 5, a: 0.42, d: 13.8, dl: -4 },
  { x: 18, y: 7, kind: "bin", text: "IMG_2291.jpeg", tier: "far", r0: -3, a: 0.38, d: 15.5, dl: -13.5 },
  { x: 9, y: 86, kind: "bin", text: "beleg_final_v2.pdf", tier: "mid", r0: 4, a: 0.48, d: 12.2, dl: -9.5 },
];

// Inside the bore: the same material, not an invented fluid. y1/y2/y3 are the
// vertical offsets at the mark (still crooked), just after it (snapped onto a
// lane) and at the outlet — derived from y0 and lane, see the block comment on
// `alBore` in index.css.
const BORE_ITEMS: BoreItem[] = [
  { y0: -14, lane: -7, kind: "phrase", phrase: 1, r0: -5, a: 0.55, d: 13, dl: -1, mobile: true },
  { y0: 12, lane: 0, kind: "bin", text: "01001101 0110 1011", r0: 4, a: 0.48, d: 12, dl: -4.5, mobile: true },
  { y0: -5, lane: 7, kind: "bin", text: "scan_0043.pdf", r0: 3, a: 0.55, d: 14, dl: -8, mobile: true },
  { y0: 18, lane: -7, kind: "bin", text: "datum;betrag;konto", r0: -4, a: 0.46, d: 13.5, dl: -11 },
  { y0: -11, lane: 0, kind: "phrase", phrase: 4, r0: 5, a: 0.5, d: 12.5, dl: -6.5 },
  { y0: 6, lane: 7, kind: "bin", text: "89 50 4E 47 0D 0A", r0: -3, a: 0.42, d: 15, dl: -2.5 },
  { y0: -18, lane: -7, kind: "bin", text: "IMG_2291.jpeg", r0: 4, a: 0.44, d: 11.5, dl: -9 },
  { y0: 15, lane: 0, kind: "bin", text: "beleg_final_v2.pdf", r0: -4, a: 0.48, d: 14.5, dl: -13 },
];

// Rays run the bore in about three seconds where a document takes thirteen.
// That gap is deliberate: it is what keeps light and material readable as two
// different things rather than one busy stream.
// Weighted toward the upper half: the tube's own shading runs to near-black
// along the bottom, and a ray placed there is simply swallowed.
const RAY_ITEMS: RayItem[] = [
  { y0: -18, w: 190, h: 2.5, a: 0.5, d: 3.2, dl: -0.2, mobile: true },
  { y0: -8, w: 220, h: 2.5, a: 0.58, d: 2.6, dl: -1.4, mobile: true },
  { y0: 2, w: 150, h: 2, a: 0.42, d: 3.6, dl: -2.1, mobile: true },
  { y0: 12, w: 175, h: 2, a: 0.34, d: 2.9, dl: -0.8 },
  { y0: -24, w: 140, h: 2, a: 0.36, d: 4.2, dl: -3 },
  { y0: -13, w: 165, h: 2, a: 0.3, d: 3.4, dl: -2.6 },
];

/** The guides that fan out from the intake, as degrees off horizontal. */
const FUNNEL_DEG = [32, 15, -4, -24, -48];

const OUT_ITEMS: OutItem[] = [
  { lane: 2, kind: "booked", tier: "near", a: 0.92, d: 11, dl: -2, mobile: true },
  { lane: 1, kind: "record", tier: "near", a: 0.9, d: 12, dl: -6.5, mobile: true },
  { lane: 4, kind: "answered", tier: "mid", a: 0.88, d: 11.5, dl: -9 },
  { lane: 0, kind: "appointment", tier: "mid", a: 0.85, d: 13, dl: -4 },
  { lane: 0, kind: "quoteA", tier: "mid", a: 0.8, d: 13, dl: -10.5 },
  { lane: 3, kind: "client", tier: "far", a: 0.72, d: 12.5, dl: -7.5, mobile: true },
  { lane: 4, kind: "quoteB", tier: "far", a: 0.7, d: 11.5, dl: -3.25 },
];

// The five lanes leaving the outlet, as the tangent of their angle. --dy is
// derived from --out-dx in CSS, so the fan keeps its shape at any width.
const LANE_SLOPE = [-0.42, -0.18, 0.04, 0.26, 0.48];
// The same angles in degrees, for the drawn guides. CSS has atan(), but its
// support is younger than the rest of this stylesheet relies on, so the
// conversion happens here where it costs nothing.
const LANE_DEG = LANE_SLOPE.map((s) => (Math.atan(s) * 180) / Math.PI);
/** Vertical offset each lane starts at, so items do not leave stacked. */
const LANE_START = [-8, -4, 0, 4, 8];

const TIERS: Array<{ tier: Tier; scroll: number; mouse: number }> = [
  { tier: "far", scroll: 0.07, mouse: 4 },
  { tier: "mid", scroll: 0.15, mouse: 9 },
  { tier: "near", scroll: 0.24, mouse: 15 },
];

const COPY = {
  de: {
    capIn: "Eingang · alles, roh",
    capMid: "Verarbeitung",
    capOut: "Ausgang · geprüft",
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
    capIn: "Incoming · all of it, raw",
    capMid: "Processing",
    capOut: "Outgoing · checked",
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

type Copy = (typeof COPY)[keyof typeof COPY];

const Check = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="hsl(38 31% 93%)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="al-note">
          <span className="al-badge"><Check /></span>
          <span className="al-quote">{kind === "quoteA" ? L.quoteA : L.quoteB}</span>
        </div>
      );
  }
}

/** The band is shaded across its width — dark at the inner rim, bright along
 *  the middle, dark again at the outer rim — so it reads as a round tube and
 *  not a flat hoop. `k` keeps the two copies' gradient ids apart. */
function CollarBand({ k, lit }: { k: string; lit: [number, number, number, number] }) {
  return (
    <svg viewBox="0 0 244 244" width="244" height="244" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`al-tube-${k}`} cx="122" cy="122" r="118" gradientUnits="userSpaceOnUse">
          <stop offset="74.5%" stopColor="hsl(38 31% 93%)" stopOpacity={lit[0]} />
          <stop offset="84%" stopColor="hsl(38 31% 93%)" stopOpacity={lit[1]} />
          <stop offset="92%" stopColor="hsl(38 31% 93%)" stopOpacity={lit[2]} />
          <stop offset="100%" stopColor="hsl(38 31% 93%)" stopOpacity={lit[3]} />
        </radialGradient>
        <linearGradient id={`al-lit-${k}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity=".3" />
          <stop offset="55%" stopColor="hsl(148 20% 4%)" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(148 20% 4%)" stopOpacity=".5" />
        </linearGradient>
      </defs>
      <circle cx="122" cy="122" r="103" stroke={`url(#al-tube-${k})`} strokeWidth="30" />
      <circle cx="122" cy="122" r="103" stroke={`url(#al-lit-${k})`} strokeWidth="30" />
    </svg>
  );
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
  /** The mark in the hero. The pipe is hung off it and runs through it. */
  coreRef: RefObject<HTMLElement>;
  className?: string;
}

const AssemblyLine = ({ coreRef, className = "" }: AssemblyLineProps) => {
  const { language } = useLanguage();
  const L = COPY[language === "de" ? "de" : "en"];
  const rootRef = useRef<HTMLDivElement>(null);
  // The dust needs the pipe's own box: it is that surface coming apart.
  const pipeRef = useRef<HTMLDivElement>(null);

  // Measure once per size change. The pipe's ends sit at 25% and 75% of the
  // width in CSS, but three things still need real pixels: the vertical anchor
  // (the mark moves with the type), how far bore items travel, and how far
  // outbound items run before they leave. Inbound items are aimed at the intake
  // rather than at the mark — they have to disappear INTO the opening.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const core = coreRef.current;
      if (!core) return;
      const rootRect = root.getBoundingClientRect();
      const coreRect = core.getBoundingClientRect();
      const W = rootRect.width;
      // Only the vertical anchor is taken from the box; the collar rides the
      // pipe's midpoint horizontally, which is not the text column's centre
      // once the run shifts left to leave the output room.
      const cy = coreRect.top - rootRect.top + coreRect.height / 2;
      root.style.setProperty("--core-y", `${cy}px`);

      // One source of truth for the whole composition: the anchor box in the
      // hero is the collar's diameter, and the pipe is sized off it in the same
      // 2.35 : 1 ratio the design was drawn at. The collar is authored at 244px
      // and scaled, because offset-path takes absolute coordinates and will not
      // follow a fluid box.
      const collar = coreRect.height;
      const pipeH = collar / 2.346;
      root.style.setProperty("--al-collar-k", `${(collar / 244).toFixed(4)}`);
      root.style.setProperty("--al-pipe-h", `${pipeH.toFixed(1)}px`);
      root.style.setProperty("--al-y", `${(pipeH / 104).toFixed(3)}`);
      // Both travel distances come from the pipe as it actually rendered, so
      // they follow --al-x0/--al-x1 rather than repeating them.
      const pipe = root.querySelector(".al-pipe");
      const mouth = root.querySelector(".al-mouth");
      if (!pipe || !mouth) return;
      const pipeRect = pipe.getBoundingClientRect();
      const pipeRight = pipeRect.right - rootRect.left;

      // Bore: intake to outlet, less the width of the two mouths.
      root.style.setProperty("--bore-dx", `${Math.max(pipeRect.width - 34, 40)}px`);
      // Outbound: as far as the tail allows once the widest card is accounted
      // for, so nothing is still at full opacity while half off-screen.
      const run = Math.min(Math.max(W - pipeRight - 118, 56), 220);
      root.style.setProperty("--out-dx", `${run}px`);

      // Inbound is aimed at the intake itself rather than at the mark — it has
      // to disappear INTO the opening. Measuring the mouth instead of deriving
      // its position keeps this correct whenever the pipe moves or resizes.
      const mouthRect = mouth.getBoundingClientRect();
      const mx = mouthRect.left - rootRect.left + mouthRect.width / 2;
      const my = mouthRect.top - rootRect.top + mouthRect.height / 2;
      root.querySelectorAll<HTMLElement>(".al-in").forEach((el) => {
        const r = el.getBoundingClientRect();
        const ex = r.left - rootRect.left + r.width / 2;
        const ey = r.top - rootRect.top + r.height / 2;
        el.style.setProperty("--dx", `${mx - ex}px`);
        el.style.setProperty("--dy", `${my - ey}px`);
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
      {/* Everything on the left arrives at one opening — drawn, so it reads at
          a glance instead of having to be inferred from the motion. */}
      <div className="al-funnel">
        {FUNNEL_DEG.map((deg, i) => (
          <span key={i} className="al-fray" style={{ "--deg": `${deg}deg` } as CSSProperties} />
        ))}
      </div>
      {/* Draws the eye to the opening without drawing a single hard line. */}
      <div className="al-glow" />
      <div className="al-spark" />

      {/* The collar's far half and the ball's far pass, under the pipe. */}
      <div className="al-collar-wrap">
        <div className="al-half-far">
          <div className="al-collar"><CollarBand k="far" lit={[0.22, 0.9, 0.62, 0.2]} /></div>
        </div>
      </div>
      <div className="al-collar-wrap">
        <div className="al-collar"><div className="al-ball al-ball--far" /></div>
      </div>

      {/* The pipe: an outer trapezoid for the lit edges, an inner one two pixels
          smaller for the skin, so the edge follows the taper at any width. */}
      <div ref={pipeRef} className="al-pipe">
        <div className="al-pipe-skin" />
      </div>
      {/* Hover it and the skin comes apart into grains; move off and they
          settle. Sits with the pipe in the stack, because it is the pipe. */}
      <PipeDust pipeRef={pipeRef} />

      {/* The intake we can see into, and the outlet further away. */}
      <div className="al-mouth">
        <div className="al-mouth-bore" />
      </div>
      <div className="al-outlet" />

      {/* Past the outlet: ruled lanes. Order you can see between the items. */}
      <div className="al-lanes">
        {LANE_DEG.map((deg, i) => (
          <span key={i} className="al-lane" style={{ "--deg": `${deg.toFixed(2)}deg` } as CSSProperties} />
        ))}
      </div>

      {/* Light down the bore, behind the material it is carrying. */}
      <div className="al-rays">
        {RAY_ITEMS.map((it, i) => (
          <span
            key={`ray-${i}`}
            className={`al-ray ${it.mobile ? "" : "al-item--desk"}`}
            style={
              {
                "--y0": `${it.y0}px`,
                "--y3": `${-16 - it.y0}px`,
                "--rw": `${it.w}px`,
                "--rh": `${it.h}px`,
                "--a": it.a,
                "--d": `${it.d}s`,
                "--dl": `${it.dl}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Inside the bore: what fell in, on its way through. */}
      <div className="al-bore">
        {BORE_ITEMS.map((it, i) => (
          <div
            key={`bore-${i}`}
            className={`al-boreitem ${it.kind === "bin" ? "al-raw--bin" : ""} ${it.mobile ? "" : "al-item--desk"}`}
            style={
              {
                "--y0": `${it.y0}px`,
                "--y1": `${(-8 - 0.2 * it.y0).toFixed(1)}px`,
                "--y2": `${(-8 + it.lane - it.y0).toFixed(1)}px`,
                "--y3": `${(-16 + 0.6 * it.lane - it.y0).toFixed(1)}px`,
                "--r0": `${it.r0}deg`,
                "--a": it.a,
                "--d": `${it.d}s`,
                "--dl": `${it.dl}s`,
              } as CSSProperties
            }
          >
            {it.text ?? L.phrases[it.phrase ?? 0]}
          </div>
        ))}
      </div>

      {/* The collar's near half and the ball's near pass, over the pipe. */}
      <div className="al-collar-wrap">
        <div className="al-half-near">
          <div className="al-collar"><CollarBand k="near" lit={[0.24, 0.95, 0.66, 0.22]} /></div>
        </div>
      </div>
      <div className="al-collar-wrap">
        <div className="al-collar"><div className="al-ball al-ball--near" /></div>
      </div>

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
                className={`al-item al-out ${it.mobile ? "" : "al-item--desk"}`}
                style={
                  {
                    "--lane-start": `${LANE_START[it.lane]}px`,
                    "--slope": LANE_SLOPE[it.lane],
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

      {/* Names the three stages, so the direction of the run is never ambiguous. */}
      <span className="al-caption al-caption--in">{L.capIn}</span>
      <span className="al-caption al-caption--mid">{L.capMid}</span>
      <span className="al-caption al-caption--out">{L.capOut}</span>
    </div>
  );
};

export default AssemblyLine;
