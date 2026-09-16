// One line drawing per delivery phase, so a visitor can see what happens at a
// stage without reading it. Drawn on currentColor in a single stroke weight, so
// they inherit the theme the same way XedaMark/XedaWordmark do — no raster
// assets, no second palette, sharp at any size.
//
// Each sits on a 120×120 grid at stroke-width 2. Keep new ones to that grammar.

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
    // 1 — requirements, systems and data, all under the magnifier
    case 1:
      return (
        <svg {...shared}>
          <rect x="16" y="34" width="34" height="46" rx="3" transform="rotate(-9 33 57)" />
          <rect x="32" y="30" width="34" height="46" rx="3" />
          <path d="M39 42h20M39 50h20M39 58h13" />
          <path d="M84 20h22a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H88" />
          <path d="M90 28h12M90 36h8" />
          <circle cx="70" cy="72" r="21" />
          <path d="M85 87l14 14" />
        </svg>
      );

    // 2 — many wishes converge on one target, and it is measurable
    case 2:
      return (
        <svg {...shared}>
          <circle cx="74" cy="52" r="26" />
          <circle cx="74" cy="52" r="14" />
          <circle cx="74" cy="52" r="4" fill="currentColor" stroke="none" />
          <path d="M8 22l30 18" />
          <path d="M32 28l6 12-12 2" />
          <path d="M6 52h28" />
          <path d="M28 46l6 6-6 6" />
          <path d="M8 82l30-18" />
          <path d="M26 60l12 2-6 12" />
          <rect x="42" y="94" width="64" height="12" rx="6" />
          <path d="M48 100h28" strokeWidth={6} />
        </svg>
      );

    // 3 — what is in scope, what is out, and a signature under it
    case 3:
      return (
        <svg {...shared}>
          <rect x="24" y="12" width="72" height="96" rx="5" />
          <rect x="32" y="24" width="56" height="40" rx="4" strokeDasharray="5 5" />
          <path d="M40 36h40M40 48h40" />
          <path d="M40 76h30" />
          <path d="M36 82l38-12" />
          <path d="M40 94c6-9 11 9 17 0s9 7 15-3" />
          <path d="M38 102h44" />
        </svg>
      );

    // 4 — the architecture, with the uncertain part proven before committing
    case 4:
      return (
        <svg {...shared}>
          <rect x="8" y="20" width="26" height="20" rx="4" />
          <rect x="8" y="76" width="26" height="20" rx="4" />
          <rect x="47" y="48" width="26" height="20" rx="4" />
          <rect x="90" y="20" width="22" height="20" rx="4" />
          <rect x="90" y="76" width="22" height="20" rx="4" />
          <path d="M34 30h7v22h6" />
          <path d="M34 86h7V64h6" />
          <path d="M73 52h9V30h8" />
          <path d="M73 64h9v22h8" />
          <circle cx="60" cy="58" r="24" strokeDasharray="5 5" />
          {/* Sits on the card, so it masks with the card token rather than a fixed colour. */}
          <circle cx="79" cy="77" r="10" fill="hsl(var(--card))" />
          <path d="M74 77l4 4 7-8" />
        </svg>
      );

    // 5 — the near term is detailed; everything later stays a backlog
    case 5:
      return (
        <svg {...shared}>
          <path d="M8 34h104" />
          <circle cx="22" cy="34" r="6" fill="currentColor" stroke="none" />
          <circle cx="52" cy="34" r="6" />
          <circle cx="80" cy="34" r="6" />
          <circle cx="106" cy="34" r="6" />
          <rect x="8" y="54" width="30" height="9" rx="3" fill="currentColor" stroke="none" />
          <rect x="8" y="70" width="24" height="9" rx="3" fill="currentColor" stroke="none" />
          <rect x="8" y="86" width="28" height="9" rx="3" fill="currentColor" stroke="none" />
          <rect x="52" y="54" width="26" height="9" rx="3" strokeDasharray="4 4" />
          <rect x="52" y="70" width="26" height="9" rx="3" strokeDasharray="4 4" />
          <rect x="88" y="54" width="24" height="9" rx="3" strokeDasharray="4 4" />
        </svg>
      );

    // 6 — it goes round, and each turn ships more
    case 6:
      return (
        <svg {...shared}>
          <path d="M104 60a44 44 0 1 1-13-31" />
          <path d="M92 8v24H68" />
          <rect x="36" y="62" width="12" height="18" rx="3" fill="currentColor" stroke="none" />
          <rect x="54" y="52" width="12" height="28" rx="3" fill="currentColor" stroke="none" />
          <rect x="72" y="42" width="12" height="38" rx="3" fill="currentColor" stroke="none" />
          <path d="M30 88h60" />
        </svg>
      );

    // 7 — the finished thing, its documentation and its keys, handed across
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
          <path d="M6 96h108" />
        </svg>
      );

    default:
      return null;
  }
};

export default PhaseIllustration;
