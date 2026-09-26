import type { Industry } from "./data";

// Where each industry's work happens, drawn behind the whole scene: the
// shared Xeda system stays in front, and this is the part that changes — a
// bookkeeping office, a factory floor, a fulfilment floor, a street of
// homes, a practice reception, a building site. Thin strokes in the
// foreground colour at low opacity (set in index.css), with objects kept to
// the edges and the floor line so the centre stays clear for Xeda.
//
// One 1200×544 canvas per industry. Desktop shows all of it; phones show its
// lower band as a strip across the top of the card.

const Accounting = () => (
  <g>
    {/* Binder shelf */}
    <path d="M20 250 H330 M20 386 H330 M20 522 H330" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <g key={i} transform={`translate(${30 + i * 32} ${i % 3 === 1 ? 276 : 264})`}>
        <rect width="26" height={i % 3 === 1 ? 110 : 122} rx="3" />
        <rect x="6" y="16" width="14" height="24" rx="1.5" />
        <circle cx="13" cy={i % 3 === 1 ? 92 : 104} r="4" />
      </g>
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={36 + i * 46} y={412} width="38" height="108" rx="3" />
    ))}
    {/* Desk: invoice tray and calculator */}
    <path d="M340 522 H1190" />
    <path d="M360 522 V494 H500 V522 M372 494 V480 H488 V494 M384 480 V468 H476 V480" />
    <rect x="530" y="468" width="62" height="54" rx="5" />
    <rect x="538" y="476" width="46" height="11" rx="1.5" />
    {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
      <rect key={`${r}${c}`} x={538 + c * 12} y={494 + r * 8.5} width="8" height="5.5" rx="1" />
    )))}
    {/* Filing cabinet */}
    <rect x="1040" y="300" width="150" height="222" rx="4" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <path d={`M1040 ${374 + i * 74 - 74} H1190`} />
        <rect x="1100" y={332 + i * 74} width="30" height="7" rx="2" />
      </g>
    ))}
    {/* Wall clock */}
    <circle cx="1120" cy="92" r="30" />
    <path d="M1120 92 V72 M1120 92 L1134 100" />
  </g>
);

const Manufacturing = () => (
  <g>
    {/* Roof trusses */}
    <path d="M0 26 H1200 M0 78 H1200" />
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d={`M${i * 80} 78 L${i * 80 + 40} 26 L${i * 80 + 80} 78`} />
    ))}
    {[180, 560, 940].map((x) => <path key={x} d={`M${x} 78 V522 M${x + 14} 78 V522`} opacity=".6" />)}
    {/* Robot arm */}
    <path d="M70 470 V440 H132 V470" />
    <path d="M101 440 L140 350 L240 326" />
    <circle cx="140" cy="350" r="10" />
    <circle cx="101" cy="440" r="7" />
    <path d="M240 326 L256 344 M240 326 L262 318 M256 344 L266 356 M262 318 L276 318" />
    {/* Conveyor across the floor */}
    <rect x="20" y="470" width="1160" height="18" rx="9" />
    {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={40 + i * 48} cy="479" r="3.5" />)}
    <path d="M60 488 V530 M1140 488 V530 M600 488 V530" />
    {[[300, 418], [370, 426], [760, 414], [840, 424]].map(([x, y]) => (
      <g key={x}>
        <rect x={x} y={y} width={x % 2 ? 52 : 44} height={470 - y} rx="2" />
        <path d={`M${x} ${y + 10} H${x + (x % 2 ? 52 : 44)}`} />
      </g>
    ))}
    {/* Pallet racking */}
    <path d="M990 150 V470 M1090 150 V470 M1188 150 V470 M990 236 H1188 M990 344 H1188 M990 450 H1188" />
    {[[1000, 196], [1044, 204], [1102, 188], [1004, 304], [1110, 300], [1150, 312], [1030, 410]].map(([x, y]) => (
      <rect key={`${x}${y}`} x={x} y={y} width="36" height={x % 3 === 0 ? 40 : 32} rx="2" />
    ))}
  </g>
);

const Ecommerce = () => (
  <g>
    {/* Storefront awning */}
    <path d="M20 40 H440 V58" />
    <path d={`M20 40 V58 ${Array.from({ length: 13 }, (_, i) => `Q${36 + i * 32} 74 ${52 + i * 32} 58`).join(" ")}`} />
    <path d="M30 74 V140 M430 74 V140" opacity=".6" />
    {/* Parcel stack with labels */}
    <path d="M20 522 H1190" />
    {[[40, 430, 96, 92], [140, 456, 72, 66], [60, 356, 70, 74], [226, 470, 60, 52]].map(([x, y, w, h]) => (
      <g key={`${x}${y}`}>
        <rect x={x} y={y} width={w} height={h} rx="2" />
        <path d={`M${x + w / 2 - 8} ${y} V${y + 18} M${x + w / 2 + 8} ${y} V${y + 18}`} />
        <rect x={x + 8} y={y + h - 26} width={w * 0.45} height="16" rx="1.5" />
        <path d={`M${x + 12} ${y + h - 21} V${y + h - 15} M${x + 16} ${y + h - 21} V${y + h - 15} M${x + 21} ${y + h - 21} V${y + h - 15}`} />
      </g>
    ))}
    {/* Returns symbol */}
    <path d="M470 488 A26 26 0 1 1 480 508" />
    <path d="M462 478 L470 488 L482 482" />
    {/* Fulfilment shelving */}
    <path d="M1000 150 V522 M1188 150 V522 M1000 254 H1188 M1000 370 H1188 M1000 480 H1188" />
    {[[1012, 204], [1064, 212], [1122, 198], [1018, 318], [1080, 326], [1136, 314], [1030, 432], [1110, 440]].map(([x, y]) => (
      <rect key={`${x}${y}`} x={x} y={y} width="42" height={(Math.floor((y - 150) / 110) + 1) * 110 + 144 - y} rx="2" />
    ))}
  </g>
);

const RealEstate = () => (
  <g>
    {/* Map fragment with a pin */}
    <g opacity=".75">
      <path d="M20 190 L250 40 M60 220 L330 44 M20 120 H320 M20 80 H300 M130 30 L60 230 M230 30 L180 230" />
    </g>
    <path d="M240 80 C240 56 272 56 272 80 C272 98 256 112 256 120 C256 112 240 98 240 80 Z" />
    <circle cx="256" cy="80" r="5.5" />
    {/* Floor plan */}
    <rect x="960" y="40" width="220" height="170" />
    <path d="M960 120 H1060 V210 M1060 40 V96 M1100 120 H1180 M1100 120 V210" />
    <path d="M1060 96 A24 24 0 0 1 1084 120" />
    <path d="M1100 150 A20 20 0 0 0 1080 170" opacity=".7" />
    {/* A street of homes along the bottom */}
    <path d="M0 522 H1200" />
    {[
      "M20 522 V430 L80 386 L140 430 V522",
      "M150 522 V396 L214 350 L278 396 V522",
      "M290 522 V446 L336 414 L382 446 V522",
      "M820 522 V440 L870 404 L920 440 V522",
      "M930 522 V360 H1060 V522",
      "M1070 522 V420 L1126 380 L1182 420 V522",
    ].map((d) => <path key={d} d={d} />)}
    {[[44, 446], [96, 446], [174, 414], [236, 414], [174, 452], [236, 452], [312, 462], [846, 462], [954, 384], [1000, 384], [954, 424], [1000, 424], [954, 464], [1000, 464], [1100, 440], [1146, 440]].map(([x, y]) => (
      <rect key={`${x}${y}`} x={x} y={y} width="16" height="14" rx="1" className="ix-envx-lit" />
    ))}
  </g>
);

const Medical = () => (
  <g>
    {/* Cross on the wall */}
    <path d="M86 60 H122 V96 H158 V132 H122 V168 H86 V132 H50 V96 H86 Z" />
    {/* Appointment board */}
    <rect x="970" y="60" width="210" height="180" rx="6" />
    <path d="M970 96 H1180" />
    {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => (
      <rect key={`${r}${c}`} x={982 + c * 40} y={108 + r * 32} width="32" height="22" rx="3" className={r === 1 && c === 2 ? "ix-envx-lit" : undefined} />
    )))}
    {/* Reception counter */}
    <path d="M20 404 H560 V522 H20 Z" />
    <path d="M12 394 H568 V404 H12 Z" />
    <path d="M60 440 H200 M60 460 H160" />
    <rect x="300" y="330" width="80" height="54" rx="4" />
    <path d="M340 384 V394 M322 394 H358" />
    <path d="M410 384 H452 V394 H410 Z M416 384 Q431 368 446 384" />
    {/* Stethoscope on the counter */}
    <path d="M480 394 C480 360 520 360 520 330 M500 394 C500 372 540 372 540 342" opacity=".8" />
    <circle cx="530" cy="322" r="10" opacity=".8" />
    <path d="M0 522 H1200" />
    {/* Plant */}
    <path d="M1130 522 V470 M1130 482 Q1100 446 1086 458 Q1102 480 1130 482 M1130 474 Q1156 438 1176 448 Q1162 474 1130 474" />
    <path d="M1112 522 L1118 494 H1142 L1148 522" />
  </g>
);

const Construction = () => (
  <g>
    {/* Tower crane */}
    <path d="M110 522 V70 M132 522 V70" />
    {Array.from({ length: 21 }, (_, i) => <path key={i} d={`M110 ${522 - i * 22} L132 ${500 - i * 22}`} />)}
    <path d="M40 70 H720 M110 70 L121 38 L132 70 M121 38 L420 70 M121 38 L60 70" />
    <rect x="40" y="70" width="36" height="26" />
    <path d="M520 70 V150" />
    <rect x="504" y="150" width="32" height="16" rx="2" />
    {/* Unfinished frame with scaffolding */}
    <path d="M170 522 V300 H420 V522" />
    <path d="M170 374 H420 M170 448 H420 M253 300 V522 M336 300 V522" />
    <path d="M430 522 V290 M452 522 V290 M430 340 H452 M430 400 H452 M430 460 H452" opacity=".7" />
    {/* Site ground and a second structure */}
    <path d="M0 522 H1200" />
    <path d="M1000 522 V360 H1180 V522 M1000 420 H1180 M1060 360 V522 M1120 360 V522" />
    {/* Blueprint roll and hard hat on the ground */}
    <rect x="860" y="500" width="110" height="18" rx="9" />
    <path d="M880 500 V518 M950 500 V518" opacity=".7" />
    <path d="M740 516 C740 486 800 486 800 516 Z M732 516 H808" />
  </g>
);

const SCENES: Record<Industry["key"], () => JSX.Element> = {
  accounting: Accounting,
  manufacturing: Manufacturing,
  ecommerce: Ecommerce,
  realestate: RealEstate,
  medical: Medical,
  construction: Construction,
};

export const Environment = ({ industry, className }: { industry: Industry["key"]; className: string }) => {
  const Scene = SCENES[industry];
  return (
    <svg
      viewBox="0 0 1200 544"
      preserveAspectRatio={className.includes("strip") ? "xMidYMax slice" : "xMidYMid slice"}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <Scene />
    </svg>
  );
};
