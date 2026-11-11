import type React from "react";
import { Cog, HeartPulse, MapPin, ScanBarcode } from "lucide-react";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import type { Industry } from "./data";

// Each industry's own instrument, so a run looks like the work it stands for
// rather than one generic scan:
//
//   accounting     a tally rolling up to the batch's total, on ledger lines
//   manufacturing  a turning gear over a conveyor carrying parts
//   ecommerce      a barcode scanner's red laser
//   realestate     a street of houses, a pin dropping on the right one
//   medical        a heartbeat trace
//   construction   a tape measure running out over a blueprint grid
//
// The desktop scene shows it inside the Xeda node while it works (and at rest
// once it is done); the phone scene makes it the scan line itself. Colours
// come from --sig, set per industry in index.css. Decorative throughout: the
// stage text and the result say the same in words.

type Key = Industry["key"];

/** The posting batch's total: the four invoices in the accounting result. */
const TALLY: Record<SiteLanguage, string> = { en: "€1,699.49", de: "1.699,49 €" };

/** Digits that roll into place, like a calculator's tally. */
const Tally = ({ lang }: { lang: SiteLanguage }) => {
  let k = 0;
  return (
    <span className="ix-tally">
      {[...TALLY[lang]].map((c, i) =>
        /\d/.test(c) ? (
          <span key={i} className="ix-tally-d" style={{ "--v": Number(c), "--k": k++ } as React.CSSProperties}>
            <span>{"01234567890123456789".split("").map((d, j) => <span key={j}>{d}</span>)}</span>
          </span>
        ) : (
          <span key={i}>{c}</span>
        ),
      )}
    </span>
  );
};

/** A gear outline: `teeth` trapezoid teeth around a circle of radius r. */
const gear = (cx: number, cy: number, r: number, teeth: number) => {
  const depth = r * 0.17;
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const ang = [a - step * 0.27, a - step * 0.13, a + step * 0.13, a + step * 0.27];
    const rad = [r - depth, r, r, r - depth];
    ang.forEach((t, j) => pts.push(`${(cx + rad[j] * Math.cos(t)).toFixed(2)} ${(cy + rad[j] * Math.sin(t)).toFixed(2)}`));
  }
  return `M${pts.join(" L")} Z`;
};
const BIG_GEAR = gear(50, 38, 34, 14);
const SMALL_GEAR = gear(86, 12, 12, 8);

/** Bar widths for a made-up barcode, bar and gap alternating. */
const BARS = [2, 1, 1, 1, 3, 1, 1, 2, 2, 1, 1, 1, 3, 2, 1, 1, 2, 1, 1, 3, 1, 1, 2, 1, 1, 2, 3, 1, 1];
const barcode = (() => {
  const total = BARS.reduce((a, b) => a + b, 0);
  const unit = 52 / total;
  let x = 24;
  const rects: { x: number; w: number }[] = [];
  BARS.forEach((w, i) => {
    if (i % 2 === 0) rects.push({ x, w: w * unit });
    x += w * unit;
  });
  return rects;
})();

/** One heartbeat across the band: flat, a small P wave, the spike, then flat. */
const ECG = "M6 83 H30 Q33 79 36 83 H40 L43 76 L47 92 L51 67 L55 90 L58 83 H64 Q68 78 72 83 H94";

/** Inside the desktop Xeda node. */
export const NodeSignature = ({ industry, lang }: { industry: Key; lang: SiteLanguage }) => (
  <span className="ix-sig" data-sig={industry} aria-hidden="true">
    <svg className="ix-sig-art" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {industry === "accounting" && (
        <g className="ix-sig-ledger">
          {[18, 30, 42, 54, 66].map((y) => <line key={y} x1="6" x2="94" y1={y} y2={y} />)}
          <line className="ix-sig-margin" x1="15" x2="15" y1="6" y2="72" />
          <line className="ix-sig-margin" x1="17.5" x2="17.5" y1="6" y2="72" />
        </g>
      )}
      {industry === "manufacturing" && (
        <>
          <path className="ix-sig-gear ix-sig-gear--big" d={BIG_GEAR} />
          <circle className="ix-sig-gear-hub" cx="50" cy="38" r="21" />
          <path className="ix-sig-gear ix-sig-gear--small" d={SMALL_GEAR} />
          <g className="ix-sig-belt">
            <rect x="10" y="84" width="80" height="5" rx="2.5" />
            <circle cx="12.5" cy="86.5" r="1.3" />
            <circle cx="87.5" cy="86.5" r="1.3" />
          </g>
          <svg x="10" y="74" width="80" height="10" viewBox="0 0 80 10" overflow="hidden">
            <g className="ix-sig-parts">
              {[-26, 0, 26, 52, 78].map((x) => <rect key={x} x={x + 4} y="2" width="8" height="8" rx="1.2" />)}
            </g>
          </svg>
        </>
      )}
      {industry === "ecommerce" && (
        <>
          <g className="ix-sig-bars">
            {barcode.map((b, i) => <rect key={i} x={b.x.toFixed(2)} y="73" width={b.w.toFixed(2)} height="18" />)}
          </g>
          <line className="ix-sig-laser" x1="14" x2="86" y1="82" y2="82" />
        </>
      )}
      {industry === "realestate" && (
        <>
          <line className="ix-sig-street" x1="8" x2="92" y1="93" y2="93" />
          {[20, 50, 80].map((cx, i) => (
            <path
              key={cx}
              className={`ix-sig-house ${i === 1 ? "is-picked" : ""}`}
              style={{ "--h": i } as React.CSSProperties}
              pathLength={100}
              d={`M${cx - 9} 93 V83.5 L${cx} 76 L${cx + 9} 83.5 V93 M${cx - 2.5} 93 V87.5 H${cx + 2.5} V93`}
            />
          ))}
          <g className="ix-sig-pin">
            <path d="M50 76 C50 76 45 71 45 68 A5 5 0 0 1 55 68 C55 71 50 76 50 76 Z" />
            <circle cx="50" cy="68" r="1.8" />
          </g>
          <ellipse className="ix-sig-ripple" cx="50" cy="93" rx="9" ry="2.4" />
        </>
      )}
      {industry === "medical" && (
        <>
          <path className="ix-sig-ecg" d={ECG} />
          <path className="ix-sig-ecg ix-sig-ecg--head" d={ECG} pathLength={100} />
        </>
      )}
      {industry === "construction" && (
        <g className="ix-sig-grid">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
            <g key={v}>
              <line x1={v} x2={v} y1="4" y2="96" />
              <line x1="4" x2="96" y1={v} y2={v} />
            </g>
          ))}
        </g>
      )}
    </svg>
    {industry === "accounting" && <span className="ix-sig-band"><Tally lang={lang} /></span>}
    {industry === "construction" && (
      <span className="ix-sig-band">
        <span className="ix-tape"><span className="ix-tape-case" /><span className="ix-tape-strip" /></span>
      </span>
    )}
  </span>
);

/** On the phone's scan line: the line's own look comes from CSS (per
 *  industry), this adds what rides on it. */
export const BeamSignature = ({ industry, lang }: { industry: Key; lang: SiteLanguage }) => {
  switch (industry) {
    case "accounting":
      return <span className="ixw-beam-badge ixw-beam-badge--wide"><Tally lang={lang} /></span>;
    case "manufacturing":
      return <span className="ixw-beam-badge"><Cog className="ixw-beam-icon ixw-spin" /></span>;
    case "ecommerce":
      return <span className="ixw-beam-badge"><ScanBarcode className="ixw-beam-icon" /></span>;
    case "realestate":
      return <span className="ixw-beam-badge"><MapPin className="ixw-beam-icon ixw-bob" /></span>;
    case "medical":
      return (
        <>
          <svg className="ixw-ecg" viewBox="0 0 400 28" preserveAspectRatio="none">
            <path d="M0 18 H120 Q128 12 136 18 H150 L158 9 L168 26 L178 2 L188 24 L196 18 H214 Q224 11 234 18 H400" />
            <path className="ixw-ecg-head" pathLength={100} d="M0 18 H120 Q128 12 136 18 H150 L158 9 L168 26 L178 2 L188 24 L196 18 H214 Q224 11 234 18 H400" />
          </svg>
          <span className="ixw-beam-badge"><HeartPulse className="ixw-beam-icon ixw-beat" /></span>
        </>
      );
    case "construction":
      return <span className="ixw-beam-badge ixw-beam-badge--case"><span /></span>;
    default:
      return null;
  }
};
