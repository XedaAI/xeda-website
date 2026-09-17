import { Search, Users, FileCheck2, DraftingCompass, ListChecks, Code2, Rocket, type LucideIcon } from "lucide-react";

// The seven-step delivery method, as a Persian water wheel.
//
// The metaphor does the explaining: a reservoir of unstructured material is
// lifted by a wheel and sent down seven descending channels, and by the last
// one it arrives as ordered, irrigated fields. It is the same argument the
// homepage hero makes with its pipe, told with the imagery the method is named
// after — so a reader who has seen one recognises the other.
//
// The water is drawn getting more ordered as it descends: scattered specks in
// the first channels, parallel lines in the last. That is the whole promise in
// one picture, and it costs nothing to say it that way rather than claiming it
// in prose underneath.
//
// Deliberately an illustration rather than a photograph: it carries the page's
// own type and colour, it stays sharp at any size, it costs no bytes worth
// counting, and it does not need a separate asset per language.

interface Step {
  n: number;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  { n: 1, icon: Search, title: "Entdecken & Prüfen", desc: "Wir verstehen, wo die Arbeit wirklich hängt — und rechnen es durch." },
  { n: 2, icon: Users, title: "Interne Abstimmung", desc: "Wir legen mit Ihnen fest, woran der Erfolg gemessen wird." },
  { n: 3, icon: FileCheck2, title: "Umfang & Freigabe", desc: "Fester Umfang, fester Preis, schriftlich — bevor gebaut wird." },
  { n: 4, icon: DraftingCompass, title: "Lösungsdesign", desc: "Wir entwerfen das System und nehmen die Risiken vorweg." },
  { n: 5, icon: ListChecks, title: "Meilensteinplanung", desc: "Sie sehen vorab, was wann fertig ist." },
  { n: 6, icon: Code2, title: "Bauen & Liefern", desc: "In Sprints bis zur Produktion, integriert in Ihre Tools." },
  { n: 7, icon: Rocket, title: "Übergabe & Betrieb", desc: "Wir nehmen es in Betrieb, betreuen es und bauen es aus." },
];

/** One descending channel. `i` is 0-based; the geometry is derived, not hand-placed. */
const Flume = ({ i }: { i: number }) => {
  const x = 452 + i * 78;
  const y = 84 + i * 40;
  const w = 96;
  const h = 17;
  return (
    <g>
      {/* The chute: a lip, a floor, and a shadowed inner wall. */}
      <path d={`M ${x} ${y} h ${w} v ${h} h ${-w} z`} fill="var(--dc-stone)" />
      <path d={`M ${x} ${y} h ${w} v 4 h ${-w} z`} fill="var(--dc-stone-lit)" />
      {/* Water in the channel. */}
      <rect x={x + 3} y={y + 4} width={w - 6} height={h - 6} rx="2" fill="var(--dc-water-soft)" />
      {/* It arrives as specks and leaves as parallel lines: the first channels
          carry scattered dots, the last carry ruled streaks. */}
      {i < 3 ? (
        <g fill="var(--dc-water)" opacity={0.85}>
          {[0.14, 0.3, 0.44, 0.58, 0.72, 0.88].map((f, k) => (
            <rect key={k} x={x + 6 + (w - 12) * f} y={y + 6 + ((k * 3) % 5)} width="2.6" height="2.6" rx="1" />
          ))}
        </g>
      ) : (
        <g stroke="var(--dc-water)" strokeWidth="1.6" strokeLinecap="round" opacity={0.9}>
          {[0, 1, 2].map((k) => (
            <line
              key={k}
              x1={x + 8}
              y1={y + 7 + k * 3.4}
              x2={x + w - 8 - (6 - i) * 4}
              y2={y + 7 + k * 3.4}
            />
          ))}
        </g>
      )}
      {/* The fall into the next channel. */}
      {i < 6 && (
        <g>
          <path
            d={`M ${x + w - 14} ${y + h} L ${x + w + 4} ${y + h} L ${x + w + 4} ${y + 40} L ${x + w - 10} ${y + 40} z`}
            fill="var(--dc-water-soft)"
          />
          <line
            x1={x + w - 6}
            y1={y + h}
            x2={x + w - 3}
            y2={y + 40}
            stroke="var(--dc-water)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      )}
      {/* Its number, so the picture and the list below are the same thing. */}
      <circle cx={x - 13} cy={y + h / 2} r="10" fill="var(--dc-water)" />
      <text
        x={x - 13}
        y={y + h / 2 + 3.6}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="var(--dc-on-water)"
      >
        {i + 1}
      </text>
    </g>
  );
};

const DeliveryCascade = () => (
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
          arbeiten kann. Jede Stufe hat ein Ergebnis, das Sie sehen und freigeben.
        </p>
      </div>

      {/* The wheel, the seven channels, and what they irrigate. */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4 md:p-8 mb-12 overflow-hidden">
        <svg
          viewBox="0 0 1200 440"
          className="w-full h-auto text-foreground"
          role="img"
          aria-label="Ein Wasserrad hebt ungeordnete Daten aus einem Becken und führt sie über sieben absteigende Kanäle in geordnete Felder."
        >
          {/* ---- the reservoir: everything, unsorted ---- */}
          <g>
            <ellipse cx="170" cy="258" rx="132" ry="32" fill="var(--dc-stone)" />
            <path d="M 38 258 v 46 a 132 32 0 0 0 264 0 v -46 z" fill="var(--dc-stone)" />
            <ellipse cx="170" cy="258" rx="118" ry="25" fill="var(--dc-water-deep)" />
            {/* Unstructured material, floating and unaligned. */}
            <g fill="var(--dc-water)" opacity="0.92">
              <rect x="98" y="248" width="15" height="19" rx="2" />
              <rect x="134" y="258" width="19" height="14" rx="2" />
              <rect x="172" y="242" width="14" height="14" rx="3" />
              <rect x="152" y="270" width="17" height="12" rx="2" />
              <rect x="206" y="252" width="13" height="17" rx="2" />
              <rect x="228" y="266" width="16" height="11" rx="2" />
              <circle cx="122" cy="272" r="4" />
              <circle cx="198" cy="274" r="3.4" />
              <circle cx="246" cy="248" r="3.4" />
            </g>
            <text
              x="170"
              y="368"
              textAnchor="middle"
              fontSize="15"
              fontWeight="700"
              letterSpacing="2"
              fill="var(--dc-label)"
            >
              UNGEORDNET
            </text>
            <text x="170" y="390" textAnchor="middle" fontSize="12.5" fill="var(--dc-label-soft)">
              Belege · PDFs · E-Mails · Scans · Tabellen
            </text>
          </g>

          {/* ---- the wheel that lifts it ---- */}
          <g transform="translate(340 176)">
            <circle r="104" fill="none" stroke="var(--dc-stone)" strokeWidth="15" />
            <circle r="86" fill="none" stroke="var(--dc-stone-lit)" strokeWidth="3" />
            {[0, 45, 90, 135].map((deg) => (
              <line
                key={deg}
                x1={-100 * Math.cos((deg * Math.PI) / 180)}
                y1={-100 * Math.sin((deg * Math.PI) / 180)}
                x2={100 * Math.cos((deg * Math.PI) / 180)}
                y2={100 * Math.sin((deg * Math.PI) / 180)}
                stroke="var(--dc-stone)"
                strokeWidth="7"
                strokeLinecap="round"
              />
            ))}
            <circle r="17" fill="var(--dc-stone)" />
            <circle r="7" fill="var(--dc-stone-lit)" />
            {/* Buckets on the rim, the upper ones carrying water. */}
            {[-150, -120, -90, -60, -30, 0, 30, 60].map((deg, k) => {
              const a = (deg * Math.PI) / 180;
              return (
                <g key={deg} transform={`translate(${112 * Math.cos(a)} ${112 * Math.sin(a)}) rotate(${deg + 90})`}>
                  <rect x="-11" y="-8" width="22" height="16" rx="2" fill="var(--dc-stone)" />
                  {k < 5 && <rect x="-8" y="-5" width="16" height="10" rx="1.5" fill="var(--dc-water)" opacity="0.9" />}
                </g>
              );
            })}
          </g>

          {/* ---- the seven channels ---- */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Flume key={i} i={i} />
          ))}

          {/* ---- what it irrigates: ordered rows and a reading off them ---- */}
          <g transform="translate(1028 348)">
            <g stroke="var(--dc-water)" strokeWidth="2.4" strokeLinecap="round" opacity="0.5">
              {[0, 1, 2, 3, 4].map((k) => (
                <line key={k} x1="0" y1={k * 13} x2="152" y2={k * 13} />
              ))}
            </g>
            <g fill="var(--dc-water)" opacity="0.92">
              {[14, 34, 23, 44, 29, 38].map((h, k) => (
                <rect key={k} x={k * 17} y={-16 - h} width="11" height={h} rx="1.5" />
              ))}
            </g>
          </g>
          <text x="1104" y="428" textAnchor="middle" fontSize="12.5" fill="var(--dc-label-soft)">
            Geprüft · gebucht · auswertbar
          </text>
        </svg>
      </div>

      {/* The same seven, in words. */}
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((s) => (
          <li key={s.n} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {s.n}
              </span>
              <s.icon className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default DeliveryCascade;
