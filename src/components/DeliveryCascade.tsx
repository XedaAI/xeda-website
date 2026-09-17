import { useState } from "react";
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
const chuteX = (i: number) => CH_X + i * CH_DX;
const chuteY = (i: number) => CH_Y + i * CH_DY;

const DeliveryCascade = () => {
  const [active, setActive] = useState<number | null>(null);
  const step = active === null ? null : STEPS[active];

  return (
    <section className="dc-flow py-20 md:py-28">
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
              <g fill="var(--dc-water)" opacity="0.92">
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
            <g transform="translate(236 236)">
              <circle r="86" fill="none" stroke="var(--dc-stone)" strokeWidth="13" />
              <circle r="71" fill="none" stroke="var(--dc-stone-lit)" strokeWidth="2.5" />
              {[0, 45, 90, 135].map((deg) => (
                <line
                  key={deg}
                  x1={-83 * Math.cos((deg * Math.PI) / 180)}
                  y1={-83 * Math.sin((deg * Math.PI) / 180)}
                  x2={83 * Math.cos((deg * Math.PI) / 180)}
                  y2={83 * Math.sin((deg * Math.PI) / 180)}
                  stroke="var(--dc-stone)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              ))}
              <circle r="14" fill="var(--dc-stone)" />
              <circle r="6" fill="var(--dc-stone-lit)" />
              {[-150, -120, -90, -60, -30, 0, 30, 60].map((deg, k) => {
                const a = (deg * Math.PI) / 180;
                return (
                  <g key={deg} transform={`translate(${93 * Math.cos(a)} ${93 * Math.sin(a)}) rotate(${deg + 90})`}>
                    <rect x="-9" y="-7" width="18" height="14" rx="2" fill="var(--dc-stone)" />
                    {k < 5 && <rect x="-6.5" y="-4.5" width="13" height="9" rx="1.5" fill="var(--dc-water)" opacity="0.9" />}
                  </g>
                );
              })}
            </g>

            {/* The bucket tipping at the top pours into the first chute. Without
                this the wheel sits beside the cascade instead of feeding it. */}
            <g>
              <path
                d={`M 246 168 L 262 162 L ${CH_X + 6} ${CH_Y + 2} L ${CH_X + 6} ${CH_Y + 11} L 250 178 z`}
                fill="var(--dc-water-soft)"
              />
              <path
                d={`M 250 172 Q ${(250 + CH_X) / 2} 162 ${CH_X + 8} ${CH_Y + 6}`}
                fill="none"
                stroke="var(--dc-water)"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.85"
              />
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
                        x1={x + CH_W - 4}
                        y1={y + CH_H}
                        x2={x + CH_DX - 5}
                        y2={y + CH_DY}
                        stroke="var(--dc-water)"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                    </>
                  )}

                  {/* Its number and its name, on the stage itself. */}
                  <circle cx={x - 14} cy={y + CH_H / 2} r="10.5" fill="var(--dc-water)" />
                  <text x={x - 14} y={y + CH_H / 2 + 3.6} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--dc-on-water)">
                    {i + 1}
                  </text>
                  <text
                    x={x + CH_W + 14}
                    y={y + 3}
                    fontSize="15"
                    fontWeight="700"
                    fill={on ? "var(--dc-water)" : "var(--dc-label)"}
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
              x1={chuteX(6) + CH_W - 5}
              y1={chuteY(6) + CH_H}
              x2={chuteX(6) + CH_W - 1}
              y2={498}
              stroke="var(--dc-water)"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.8"
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
          {/* The readout. A fixed screen in the empty upper right rather than a
              panel that follows the cursor: it never covers what you are
              pointing at, it needs no per-stage anchoring, and it gives the
              drawing somewhere for the eye to land. */}
          <div className="dc-screen hidden xl:flex">
            {step && active !== null ? (
              <>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="dc-screen-n">{active + 1}</span>
                  <h3 className="font-semibold text-foreground leading-tight">{step.title}</h3>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1.5">
                  Das bekommen Sie
                </p>
                <ul className="space-y-1">
                  {step.deliverables.map((d) => (
                    <li key={d} className="text-sm text-foreground leading-snug flex gap-2">
                      <span aria-hidden="true" className="text-primary">·</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="m-auto text-center">
                <p className="text-sm font-medium text-foreground mb-1">Fahren Sie über eine Stufe</p>
                <p className="text-sm text-muted-foreground">
                  Dann steht hier, was Sie am Ende dieser Stufe in der Hand halten.
                </p>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* The same seven in full, always readable — on a phone, by keyboard,
            and by a crawler. */}
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {i + 1}
                </span>
                <s.icon className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                Das bekommen Sie
              </p>
              <ul className="space-y-1.5">
                {s.deliverables.map((d) => (
                  <li key={d} className="text-sm text-foreground leading-snug flex gap-2">
                    <span aria-hidden="true" className="text-primary">·</span>
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
