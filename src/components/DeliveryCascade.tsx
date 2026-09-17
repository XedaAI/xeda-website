import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Search, Users, FileCheck2, DraftingCompass, ListChecks, Code2, Rocket, type LucideIcon } from "lucide-react";

// The seven-step delivery method, as a Persian water wheel.
//
// A reservoir of unstructured material is lifted by the wheel and sent down
// seven descending channels, and by the last one it arrives as ordered,
// irrigated rows. The water is drawn getting more ordered as it descends —
// scattered specks in the first channels, ruled parallel lines in the last. It
// is the same argument the homepage hero makes with its pipe, told with the
// imagery the method is named after, so a reader who has seen one recognises
// the other.
//
// Every channel carries its own name, and hovering one shows what that stage
// actually hands over. The deliverables are also printed in the cards below,
// always visible: they are the most convincing thing on the page, and content
// that only exists on hover is invisible to a phone, a keyboard and a crawler.
// The duplication is in the rendering only — one list, in STEPS, read twice.

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
  /** What you are actually handed at the end of this stage. */
  deliverables: string[];
}

const STEPS: Step[] = [
  {
    icon: Search,
    title: "Entdecken & Prüfen",
    desc: "Wir verstehen, wo die Arbeit wirklich hängt.",
    deliverables: [
      "Prozesslandkarte der betroffenen Abläufe",
      "Aufwand in Stunden und Euro, gerechnet",
      "Priorisierte Liste der Automatisierungs-Kandidaten",
    ],
  },
  {
    icon: Users,
    title: "Interne Abstimmung",
    desc: "Wir legen fest, woran der Erfolg gemessen wird.",
    deliverables: [
      "Definierte Erfolgskennzahlen mit Ausgangswert",
      "Benannte Ansprechpartner je Bereich",
      "Abgestimmter Zielzustand, schriftlich",
    ],
  },
  {
    icon: FileCheck2,
    title: "Umfang & Freigabe",
    desc: "Fester Umfang, fester Preis — bevor gebaut wird.",
    deliverables: [
      "Leistungsbeschreibung mit klarer Abgrenzung",
      "Festpreis und verbindlicher Termin",
      "Unterschriebene Freigabe",
    ],
  },
  {
    icon: DraftingCompass,
    title: "Lösungsdesign",
    desc: "Wir entwerfen das System und nehmen Risiken vorweg.",
    deliverables: [
      "Architektur und Datenflüsse",
      "Schnittstellenliste — DATEV, DMS, Postfach",
      "Risiken mit Gegenmaßnahmen",
      "AVV-Entwurf und Löschkonzept",
    ],
  },
  {
    icon: ListChecks,
    title: "Meilensteinplanung",
    desc: "Sie sehen vorab, was wann fertig ist.",
    deliverables: [
      "Sprintplan mit Terminen",
      "Abnahmekriterien je Meilenstein",
      "Testplan mit Ihren echten Belegen",
    ],
  },
  {
    icon: Code2,
    title: "Bauen & Liefern",
    desc: "In Sprints bis zur Produktion, in Ihren Tools.",
    deliverables: [
      "Lauffähiges System in Ihrer Umgebung",
      "Demo alle zwei Wochen, kein Blindflug",
      "Dokumentation und Testprotokoll",
    ],
  },
  {
    icon: Rocket,
    title: "Übergabe & Betrieb",
    desc: "Wir nehmen es in Betrieb und betreuen es.",
    deliverables: [
      "Schulung für Ihr Team",
      "Betriebshandbuch und Monitoring",
      "Fester Ansprechpartner und Reaktionszeiten",
      "Roadmap für den Ausbau",
    ],
  },
];

// Geometry, in viewBox units. Derived rather than hand-placed, so the cascade
// and the popup that follows it can never drift apart. The x step must be at
// least the chute width, or the water would have to fall backwards into the
// next chute.
const VB_W = 1200;
const VB_H = 600;
// The first chute starts inside the wheel's rim rather than floating beside it:
// at y = CH_Y the wheel reaches x ≈ 300, so a chute beginning at 290 overlaps
// it by about ten units and the two read as one machine.
const CH_X = 290;
const CH_Y = 178;
const CH_DX = 82;
const CH_DY = 46;
const CH_W = 78;
const CH_H = 13;
// The wheel and its buckets.
//
// It turns CLOCKWISE: a bucket leaves the basin at the bottom, is carried up
// the far side, crests the top, and tips at the pour point up-right where the
// first chute waits — so it is already on its way down when it empties, which
// is how an overshot wheel actually delivers. That is a 223-degree carry, most
// of a turn.
//
// Each bucket's water is on its own copy of one animation, phase-shifted by a
// negative delay so its progress is zero exactly when that bucket sits at the
// bottom of the wheel. Everything else follows from that.
// 16s, not 26: the spokes repeat every 45 degrees, so at 26s the wheel looked
// identical for 3.3 seconds at a stretch and read as standing still.
const WHEEL_SECONDS = 16;
// Buckets all the way round rather than over a 210-degree arc. With water only
// on the ascending side, what you see travelling is a band of blue — which is
// what makes the rotation legible at all, the rim being dark on dark.
const BUCKET_DEG = [-180, -150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
/** Angle at the bottom of the wheel, where a bucket fills. SVG y runs down. */
const BOTTOM_DEG = 90;
// A NEGATIVE animation-delay means the animation has already been running that
// long, so the offset adds to elapsed time rather than subtracting from it. The
// first version negated this and put every bucket half a turn out of phase —
// full on the way down, empty on the way up.
const bucketDelay = (deg: number) => {
  // Clockwise, so the angle grows with time: the bucket reaches the bottom
  // after (90 - start) degrees of travel.
  let d = WHEEL_SECONDS * ((BOTTOM_DEG - deg) / 360);
  while (d > 0) d -= WHEEL_SECONDS;
  while (d <= -WHEEL_SECONDS) d += WHEEL_SECONDS;
  return d;
};

/** The stage's own hue. Defined in index.css as an HSL triple, so one value
 *  serves both the solid fill and every washed-back form of it. */
const tint = (i: number) => `var(--dc-s${i + 1})`;
const chuteX = (i: number) => CH_X + i * CH_DX;
const chuteY = (i: number) => CH_Y + i * CH_DY;

const DeliveryCascade = () => {
  const [active, setActive] = useState<number | null>(null);
  const step = active === null ? null : STEPS[active];
  const rootRef = useRef<HTMLElement>(null);

  // Hold every animation while the section is off screen rather than burning
  // frames on a drawing nobody is looking at.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("is-paused", !e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={rootRef} className="dc-flow py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-wide text-primary mb-3 block">
            Unsere Liefermethode
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
            Sieben Stufen vom Belegchaos zur belastbaren Zahl
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Wie ein persisches Wasserrad: Wir heben, was ungeordnet liegt, und führen es über
            sieben kontrollierte Stufen — bis am Ende etwas ankommt, mit dem Ihre Kanzlei
            arbeiten kann. Jede Stufe hat ein Ergebnis, das Sie in der Hand halten.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-4 md:p-8 mb-12">
          {/* The positioning context is this wrapper, not the padded card:
              the popup's coordinates come from the viewBox, so they are only
              correct against a box that IS the drawing. Anchoring to the card
              shifted every one of them by its padding. */}
          <div className="relative">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full h-auto font-sans"
            role="img"
            aria-label="Ein Wasserrad hebt ungeordnete Belege aus einem Becken und führt sie über sieben benannte Stufen in geordnete, auswertbare Daten."
          >
            {/* ---- the reservoir: everything, unsorted ---- */}
            <g>
              <ellipse cx="200" cy="340" rx="112" ry="28" fill="var(--dc-stone)" />
              <path d="M 88 340 v 40 a 112 28 0 0 0 224 0 v -40 z" fill="var(--dc-stone)" />
              <ellipse cx="200" cy="340" rx="99" ry="22" fill="var(--dc-water-deep)" />
              {/* Rings opening on the surface where the wheel dips in. */}
              <ellipse className="dc-ripple" cx="200" cy="340" rx="99" ry="22" fill="none" stroke="var(--dc-water)" strokeWidth="1.5" />
              <ellipse className="dc-ripple dc-ripple--2" cx="200" cy="340" rx="99" ry="22" fill="none" stroke="var(--dc-water)" strokeWidth="1.5" />
              <g className="dc-bob" fill="var(--dc-water)" opacity="0.92">
                <rect x="138" y="332" width="14" height="18" rx="2" />
                <rect x="170" y="340" width="18" height="13" rx="2" />
                <rect x="204" y="326" width="13" height="13" rx="3" />
                <rect x="186" y="350" width="16" height="11" rx="2" />
                <rect x="232" y="334" width="12" height="16" rx="2" />
                <rect x="252" y="346" width="15" height="10" rx="2" />
                <circle cx="158" cy="352" r="3.6" />
                <circle cx="226" cy="354" r="3.2" />
                <circle cx="266" cy="330" r="3.2" />
              </g>
              <text x="200" y="448" textAnchor="middle" fontSize="15" fontWeight="700" letterSpacing="2" fill="var(--dc-label)">
                UNGEORDNET
              </text>
              <text x="200" y="470" textAnchor="middle" fontSize="12.5" fill="var(--dc-label-soft)">
                Belege · PDFs · E-Mails · Scans · Tabellen
              </text>
            </g>

            {/* ---- the wheel that lifts it ---- */}
            {/* The rotation sits on the OUTER group, which carries no
                transform of its own, so its coordinate system is the viewBox
                and transform-origin can name the axis exactly. */}
            <g className="dc-wheel">
              <g transform="translate(236 236)">
              <circle r="86" fill="none" stroke="var(--dc-wood)" strokeWidth="13" />
              <circle r="71" fill="none" stroke="var(--dc-wood-lit)" strokeWidth="2.5" />
              {[0, 45, 90, 135].map((deg) => (
                <line
                  key={deg}
                  x1={-83 * Math.cos((deg * Math.PI) / 180)}
                  y1={-83 * Math.sin((deg * Math.PI) / 180)}
                  x2={83 * Math.cos((deg * Math.PI) / 180)}
                  y2={83 * Math.sin((deg * Math.PI) / 180)}
                  stroke="var(--dc-wood)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              ))}
              <circle r="14" fill="var(--dc-wood)" />
              <circle r="6" fill="var(--dc-wood-lit)" />
              {BUCKET_DEG.map((deg) => {
                const a = (deg * Math.PI) / 180;
                return (
                  <g key={deg} transform={`translate(${93 * Math.cos(a)} ${93 * Math.sin(a)}) rotate(${deg + 90})`}>
                    <rect x="-9" y="-7" width="18" height="14" rx="2" fill="var(--dc-wood-lit)" />
                    <rect
                      className="dc-bucket"
                      x="-6.5"
                      y="-4.5"
                      width="13"
                      height="9"
                      rx="1.5"
                      fill="var(--dc-water)"
                      style={{ animationDelay: `${bucketDelay(deg).toFixed(2)}s` }}
                    />
                  </g>
                );
              })}
              </g>
            </g>

            {/* ---- the seven named stages ---- */}
            {STEPS.map((s, i) => {
              const x = chuteX(i);
              const y = chuteY(i);
              const on = active === i;
              return (
                <g
                  key={s.title}
                  tabIndex={0}
                  className="dc-stage"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  {/* Hit area: the whole row, so the name is as clickable as the chute. */}
                  <rect x={x - 30} y={y - 12} width={VB_W - x + 20} height={CH_DY - 6} fill="transparent" />

                  {/* The chute. */}
                  <path d={`M ${x} ${y} h ${CH_W} v ${CH_H} h ${-CH_W} z`} fill="var(--dc-stone)" />
                  <path d={`M ${x} ${y} h ${CH_W} v 3.5 h ${-CH_W} z`} fill="var(--dc-stone-lit)" />
                  <rect x={x + 2.5} y={y + 3.5} width={CH_W - 5} height={CH_H - 5} rx="2" fill="var(--dc-water-soft)" />
                  {/* The current itself. Delayed per stage so the flow arrives
                      down the staircase rather than everywhere at once. */}
                  <line
                    className="dc-stream"
                    x1={x + 4}
                    y1={y + CH_H / 2}
                    x2={x + CH_W - 4}
                    y2={y + CH_H / 2}
                    stroke="var(--dc-water)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{ animationDelay: `${i * 0.13}s` }}
                  />

                  {/* Specks early, ruled lines late: the ordering, shown. */}
                  {i < 3 ? (
                    <g fill="var(--dc-water)" opacity="0.85">
                      {[0.12, 0.32, 0.5, 0.68, 0.86].map((f, k) => (
                        <rect key={k} x={x + 5 + (CH_W - 10) * f} y={y + 5 + ((k * 3) % 5)} width="2.4" height="2.4" rx="1" />
                      ))}
                    </g>
                  ) : (
                    <g stroke="var(--dc-water)" strokeWidth="1.5" strokeLinecap="round" opacity="0.9">
                      {[0, 1, 2].map((k) => (
                        <line key={k} x1={x + 6} y1={y + 6 + k * 3.2} x2={x + CH_W - 6 - (6 - i) * 2.5} y2={y + 6 + k * 3.2} />
                      ))}
                    </g>
                  )}

                  {/* The fall into the next chute. */}
                  {i < STEPS.length - 1 && (
                    <>
                      <path
                        d={`M ${x + CH_W - 10} ${y + CH_H} L ${x + CH_W} ${y + CH_H} L ${x + CH_DX} ${y + CH_DY} L ${x + CH_DX - 12} ${y + CH_DY} z`}
                        fill="var(--dc-water-soft)"
                      />
                      <line
                        className="dc-fall"
                        x1={x + CH_W - 4}
                        y1={y + CH_H}
                        x2={x + CH_DX - 5}
                        y2={y + CH_DY}
                        stroke="var(--dc-water)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        style={{ animationDelay: `${i * 0.13 + 0.06}s` }}
                      />
                    </>
                  )}

                  {/* Its number and its name, on the stage itself. */}
                  <circle cx={x - 14} cy={y + CH_H / 2} r="10.5" fill={`hsl(${tint(i)})`} />
                  <text x={x - 14} y={y + CH_H / 2 + 3.6} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--dc-on-water)">
                    {i + 1}
                  </text>
                  <text
                    x={x + CH_W + 14}
                    y={y + 3}
                    fontSize="15"
                    fontWeight="700"
                    fill={on ? `hsl(${tint(i)})` : "var(--dc-label)"}
                  >
                    {s.title}
                  </text>
                  <text x={x + CH_W + 14} y={y + 19} fontSize="12.5" fill="var(--dc-label-soft)">
                    {s.desc}
                  </text>
                </g>
              );
            })}

            {/* ---- what it irrigates ----
                The bars used to sit ABOVE the rows, which put them straight
                through the last stage's own label, and the caption sat on top
                of the rows. Rows and bars now stand side by side in a band
                below everything, and the group starts at the last chute's
                right edge so the water falls into it rather than past it. */}
            <path
              d={`M ${chuteX(6) + CH_W - 12} ${chuteY(6) + CH_H} L ${chuteX(6) + CH_W} ${chuteY(6) + CH_H} L ${chuteX(6) + CH_W + 4} 498 L ${chuteX(6) + CH_W - 8} 498 z`}
              fill="var(--dc-water-soft)"
            />
            <line
              className="dc-fall"
              x1={chuteX(6) + CH_W - 5}
              y1={chuteY(6) + CH_H}
              x2={chuteX(6) + CH_W - 1}
              y2={498}
              stroke="var(--dc-water)"
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{ animationDelay: "0.85s" }}
            />
            <g transform={`translate(${chuteX(6) + CH_W} 500)`}>
              <g stroke="var(--dc-water)" strokeWidth="2.4" strokeLinecap="round" opacity="0.5">
                {[0, 1, 2, 3, 4].map((k) => (
                  <line key={k} x1="0" y1={k * 12} x2="140" y2={k * 12} />
                ))}
              </g>
              <g fill="var(--dc-water)" opacity="0.92">
                {[12, 28, 19, 36, 24, 31].map((h, k) => (
                  <rect key={k} x={166 + k * 17} y={48 - h} width="11" height={h} rx="1.5" />
                ))}
              </g>
              <text x="140" y="80" textAnchor="middle" fontSize="12.5" fill="var(--dc-label-soft)">
                Geprüft · gebucht · auswertbar
              </text>
            </g>
          </svg>

          {/* What that stage hands over. Positioned from the same geometry the
              chute is drawn from, as a percentage, so it tracks the SVG at any
              width instead of needing its own measurement. */}
          {/* The readout: a framed display mounted in the empty upper right.
              It holds one position rather than chasing the cursor, so it can
              never cover what you are pointing at and needs no per-stage
              anchoring. Keyed on the active stage so React remounts the body
              on every change and the entry animation replays — including on
              the way back to idle, which is what gives it an exit without
              needing exit-animation machinery. */}
          <div
            className="dc-screen hidden xl:flex"
            style={{ "--dc-accent": active === null ? "var(--primary)" : tint(active) } as CSSProperties}
          >
            <span className="dc-corner dc-corner--tl" aria-hidden="true" />
            <span className="dc-corner dc-corner--tr" aria-hidden="true" />
            <span className="dc-corner dc-corner--bl" aria-hidden="true" />
            <span className="dc-corner dc-corner--br" aria-hidden="true" />
            <span key={`sweep-${active ?? "idle"}`} className="dc-sweep" aria-hidden="true" />

            <div key={active ?? "idle"} className="dc-body">
              {step && active !== null ? (
                <>
                  <div className="dc-line flex items-center gap-2.5 mb-2" style={{ "--i": 0 } as CSSProperties}>
                    <span className="dc-screen-n">{active + 1}</span>
                    <h3 className="font-semibold text-foreground leading-tight">{step.title}</h3>
                  </div>
                  <p
                    className="dc-line dc-accent text-xs font-semibold uppercase tracking-wide mb-1.5"
                    style={{ "--i": 1 } as CSSProperties}
                  >
                    Das bekommen Sie
                  </p>
                  <ul className="space-y-1">
                    {step.deliverables.map((d, k) => (
                      <li
                        key={d}
                        className="dc-line text-sm text-foreground leading-snug flex gap-2"
                        style={{ "--i": k + 2 } as CSSProperties}
                      >
                        <span aria-hidden="true" className="dc-accent">·</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="m-auto text-center">
                  <p className="dc-line text-sm font-medium text-foreground mb-1" style={{ "--i": 0 } as CSSProperties}>
                    Fahren Sie über eine Stufe
                  </p>
                  <p className="dc-line text-sm text-muted-foreground" style={{ "--i": 1 } as CSSProperties}>
                    Dann steht hier, was Sie am Ende dieser Stufe in der Hand halten.
                  </p>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* The same seven in full, always readable — on a phone, by keyboard,
            and by a crawler. */}
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="dc-card rounded-xl border border-border bg-card p-5"
              style={{ "--dc-accent": tint(i) } as CSSProperties}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="dc-card-n flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {i + 1}
                </span>
                <s.icon className="dc-accent w-5 h-5 flex-shrink-0" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
              <p className="dc-accent text-xs font-semibold uppercase tracking-wide mb-2">
                Das bekommen Sie
              </p>
              <ul className="space-y-1.5">
                {s.deliverables.map((d) => (
                  <li key={d} className="text-sm text-foreground leading-snug flex gap-2">
                    <span aria-hidden="true" className="dc-accent">·</span>
                    {d}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default DeliveryCascade;
