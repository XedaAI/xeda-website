// One line drawing per delivery phase, so a visitor can see what happens at a
// stage without reading it. Drawn on currentColor in a single stroke weight, so
// they inherit the theme the same way XedaMark/XedaWordmark do — no raster
// assets, no second palette, sharp at any size.
//
// Each sits on a 120×120 grid at stroke-width 2. Keep new ones to that grammar,
// and keep shapes closed, arrowheads on their shafts, and objects resting on
// their baselines — an open path or a floating object reads as a mistake at
// this size even when nothing is clipped.

interface PhaseIllustrationProps {
  /** Phase number, 1–7. */
  n: number;
  className?: string;
}

const PhaseIllustration = ({ n, className = "" }: PhaseIllustrationProps) => {
  const shared = {
    viewBox: "0 0 120 120",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (n) {
    // 1 — requirements, systems and data, all under the magnifier.
    // The lens sits over the documents and enlarges a line, rather than hovering
    // beside them; the data store is a closed cylinder.
    case 1:
      return (
        <svg {...shared}>
          <rect x="14" y="36" width="32" height="44" rx="3" transform="rotate(-9 30 58)" />
          <rect x="30" y="30" width="34" height="46" rx="3" />
          <path d="M37 40h20M37 48h20" />
          <ellipse cx="98" cy="22" rx="14" ry="6" />
          <path d="M84 22v16a14 6 0 0 0 28 0V22" />
          <path d="M84 30a14 6 0 0 0 28 0" />
          <circle cx="58" cy="66" r="20" />
          <path d="M48 66h16" strokeWidth={3.5} />
          <path d="M72 80l14 14" />
        </svg>
      );

    // 2 — many wishes converge to one point, one arrow aims at the target, and
    // the bar underneath says it is measurable.
    case 2:
      return (
        <svg {...shared}>
          <circle cx="76" cy="52" r="26" />
          <circle cx="76" cy="52" r="14" />
          <circle cx="76" cy="52" r="4" fill="currentColor" stroke="none" />
          <path d="M8 22L38 52" />
          <path d="M8 52h30" />
          <path d="M8 82L38 52" />
          <path d="M38 52h10" />
          <path d="M43 47l5 5-5 5" />
          <rect x="44" y="94" width="64" height="12" rx="6" />
          <path d="M50 100h28" strokeWidth={6} />
        </svg>
      );

    // 3 — what is in scope, what is struck out of it, and a signature under both.
    case 3:
      return (
        <svg {...shared}>
          <rect x="24" y="12" width="72" height="96" rx="5" />
          <rect x="32" y="24" width="56" height="40" rx="4" strokeDasharray="5 5" />
          <path d="M40 36h40M40 48h40" />
          <path d="M34 72l8 8M42 72l-8 8" />
          <path d="M50 76h26" />
          <path d="M40 94c6-9 11 9 17 0s9 7 15-3" />
          <path d="M38 102h44" />
        </svg>
      );

    // 4 — the architecture, with the uncertain part circled and proven. The tick
    // sits on top of the dashed circle, clear of every connector.
    case 4:
      return (
        <svg {...shared}>
          <rect x="8" y="20" width="26" height="20" rx="4" />
          <rect x="8" y="76" width="26" height="20" rx="4" />
          <rect x="47" y="48" width="26" height="20" rx="4" />
          <rect x="88" y="20" width="24" height="20" rx="4" />
          <rect x="88" y="76" width="24" height="20" rx="4" />
          <path d="M34 30h7v22h6" />
          <path d="M34 86h7V64h6" />
          <path d="M73 52h7V30h8" />
          <path d="M73 64h7v22h8" />
          <circle cx="60" cy="58" r="24" strokeDasharray="5 5" />
          {/* Masks the dashed circle behind it, so it fills with the card token
              rather than a fixed colour and stays correct in both themes. */}
          <circle cx="60" cy="34" r="10" fill="hsl(var(--card))" />
          <path d="M55 34l4 4 7-8" />
        </svg>
      );

    // 5 — three milestones; only the first is broken into detailed work, the
    // rest stay a dashed backlog. Columns sit under their own milestone.
    case 5:
      return (
        <svg {...shared}>
          <path d="M8 34h104" />
          <circle cx="26" cy="34" r="6" fill="currentColor" stroke="none" />
          <circle cx="62" cy="34" r="6" />
          <circle cx="98" cy="34" r="6" />
          <rect x="10" y="54" width="32" height="9" rx="3" fill="currentColor" stroke="none" />
          <rect x="10" y="70" width="26" height="9" rx="3" fill="currentColor" stroke="none" />
          <rect x="10" y="86" width="30" height="9" rx="3" fill="currentColor" stroke="none" />
          <rect x="46" y="54" width="32" height="9" rx="3" strokeDasharray="4 4" />
          <rect x="46" y="70" width="32" height="9" rx="3" strokeDasharray="4 4" />
          <rect x="82" y="54" width="32" height="9" rx="3" strokeDasharray="4 4" />
        </svg>
      );

    // 6 — it goes round, and each turn ships more. The barb sits on the arc's
    // end and the bars stand on the baseline.
    case 6:
      return (
        <svg {...shared}>
          <path d="M104 60a44 44 0 1 1-13-31" />
          <path d="M80 25l11 4-4-11" />
          <rect x="36" y="62" width="12" height="26" rx="3" fill="currentColor" stroke="none" />
          <rect x="54" y="52" width="12" height="36" rx="3" fill="currentColor" stroke="none" />
          <rect x="72" y="42" width="12" height="46" rx="3" fill="currentColor" stroke="none" />
          <path d="M30 88h60" />
        </svg>
      );

    // 7 — the finished thing, its documentation and its keys, handed across.
    // Package and client both stand on the same ground line.
    case 7:
      return (
        <svg {...shared}>
          <rect x="10" y="50" width="42" height="38" rx="4" />
          <path d="M10 62h42M31 50v12" />
          <path d="M20 74l6 6 12-13" />
          <rect x="46" y="14" width="18" height="24" rx="3" />
          <path d="M51 22h8M51 28h8" />
          <circle cx="80" cy="26" r="7" />
          <path d="M87 26h16M99 26v6" />
          <path d="M58 68h26" />
          <path d="M78 62l7 6-7 6" />
          <rect x="90" y="52" width="22" height="36" rx="3" />
          <path d="M96 62h3M103 62h3M96 72h3M103 72h3" />
          <path d="M6 88h108" />
        </svg>
      );

    default:
      return null;
  }
};

export default PhaseIllustration;
