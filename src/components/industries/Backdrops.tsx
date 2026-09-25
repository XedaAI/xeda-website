import type { Industry } from "./data";

// Faint line drawings behind the messy inputs: where the work happens. They
// are scenery — thin strokes in the foreground colour at low opacity — so the
// industry reads at a glance without competing with the cards on top.
// Drawn on a 400×300 canvas anchored to the bottom of the input area.

const Accounting = () => (
  <g>
    {/* Binder shelf */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i} transform={`translate(${218 + i * 26} 150)`}>
        <rect width="22" height="96" rx="3" />
        <rect x="5" y="14" width="12" height="20" rx="1.5" />
        <circle cx="11" cy="78" r="3.5" />
      </g>
    ))}
    <path d="M200 246 H380" />
    {/* Paper tray and calculator on the desk */}
    <path d="M20 268 H380" />
    <path d="M36 268 V246 H128 V268 M44 246 V236 H120 V246" />
    <rect x="150" y="224" width="46" height="44" rx="4" />
    <rect x="156" y="230" width="34" height="9" rx="1.5" />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
      <rect key={`${r}${c}`} x={157 + c * 11} y={244 + r * 7.5} width="8" height="5" rx="1" />
    )))}
  </g>
);

const Manufacturing = () => (
  <g>
    {/* Factory hall with a sawtooth roof */}
    <path d="M190 150 V96 L222 76 V96 L254 76 V96 L286 76 V96 L318 76 V150" />
    <path d="M334 150 V58 H350 V150" />
    <path d="M180 150 H392" />
    {/* Robot arm */}
    <path d="M70 226 V206 H96 V226" />
    <path d="M83 206 L104 160 L150 150" />
    <circle cx="104" cy="160" r="6" />
    <path d="M150 150 L158 162 M150 150 L162 146" />
    {/* Conveyor with rollers and boxes */}
    <rect x="20" y="238" width="368" height="14" rx="7" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <circle key={i} cx={34 + i * 38} cy="245" r="3" />)}
    <path d="M40 252 V276 M370 252 V276" />
    {[[150, 212], [214, 206], [286, 214]].map(([x, y]) => (
      <g key={x} transform={`translate(${x} ${y})`}>
        <rect width={x === 214 ? 40 : 30} height={238 - y} rx="2" />
        <path d={`M0 8 H${x === 214 ? 40 : 30} M${x === 214 ? 20 : 15} 0 V8`} />
      </g>
    ))}
  </g>
);

const Ecommerce = () => (
  <g>
    {/* Storefront awning */}
    <path d="M196 96 H388 V112" />
    <path d="M196 96 V112 Q204 124 212 112 Q220 124 228 112 Q236 124 244 112 Q252 124 260 112 Q268 124 276 112 Q284 124 292 112 Q300 124 308 112 Q316 124 324 112 Q332 124 340 112 Q348 124 356 112 Q364 124 372 112 Q380 124 388 112" />
    <path d="M204 124 V200 M380 124 V200" />
    {/* Parcel stack */}
    <path d="M20 270 H392" />
    {[[40, 218, 64, 52], [112, 234, 48, 36], [58, 178, 46, 40]].map(([x, y, w, h]) => (
      <g key={`${x}${y}`}>
        <rect x={x} y={y} width={w} height={h} rx="2" />
        <path d={`M${x + w / 2 - 6} ${y} V${y + 14} M${x + w / 2 + 6} ${y} V${y + 14}`} />
      </g>
    ))}
    {/* Shopping bag */}
    <path d="M300 270 L308 214 H356 L364 270 Z" />
    <path d="M318 214 Q318 196 332 196 Q346 196 346 214" />
  </g>
);

const RealEstate = () => (
  <g>
    {/* Map grid with a pin */}
    <g opacity=".7">
      <path d="M20 290 L120 210 M110 290 L190 214 M200 290 L256 222 M20 250 H300 M40 226 H320" />
    </g>
    <path d="M300 214 C300 196 326 196 326 214 C326 228 313 240 313 246 C313 240 300 228 300 214 Z" />
    <circle cx="313" cy="213" r="4.5" />
    {/* Houses */}
    <path d="M150 150 V112 L180 90 L210 112 V150" />
    <path d="M214 150 V100 L250 74 L286 100 V150" />
    <path d="M290 150 V118 L314 100 L338 118 V150" />
    <path d="M140 150 H392" />
    {[[164, 122], [184, 122], [230, 110], [256, 110], [230, 128], [256, 128], [306, 126]].map(([x, y]) => (
      <rect key={`${x}${y}`} x={x} y={y} width="10" height="9" rx="1" />
    ))}
  </g>
);

const Medical = () => (
  <g>
    {/* Cross on the wall */}
    <path d="M292 58 H316 V82 H340 V106 H316 V130 H292 V106 H268 V82 H292 Z" />
    {/* Reception counter */}
    <path d="M24 214 H372 V276 H24 Z" />
    <path d="M18 206 H378 V214 H18 Z" />
    <path d="M60 236 H140 M60 250 H112" />
    {/* Monitor and phone on the counter */}
    <rect x="200" y="160" width="54" height="36" rx="3" />
    <path d="M227 196 V206 M214 206 H240" />
    <path d="M276 198 H306 V206 H276 Z M280 198 Q291 186 302 198" />
    {/* Plant */}
    <path d="M344 206 V184 M344 190 Q330 172 322 178 Q330 190 344 190 M344 186 Q356 166 366 172 Q360 186 344 186" />
    <path d="M334 206 L338 190 H350 L354 206" />
  </g>
);

const Construction = () => (
  <g>
    {/* Tower crane */}
    <path d="M290 270 V60 M306 270 V60" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
      <path key={i} d={`M290 ${270 - i * 21} L306 ${249 - i * 21}`} />
    ))}
    <path d="M200 60 H392 M290 60 L298 40 L306 60 M298 40 L220 60 M298 40 L380 60" />
    <path d="M232 60 V100" />
    <rect x="222" y="100" width="20" height="12" rx="1.5" />
    <rect x="370" y="60" width="18" height="16" />
    {/* Unfinished frame with scaffolding */}
    <path d="M28 270 V160 H196 V270" />
    <path d="M28 196 H196 M28 232 H196 M84 160 V270 M140 160 V270" />
    <path d="M20 270 H392" />
    <path d="M200 270 V150 M200 190 H214 M200 230 H214 M214 150 V270" opacity=".7" />
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

export const Backdrop = ({ industry, className = "ix-env" }: { industry: Industry["key"]; className?: string }) => {
  const Scene = SCENES[industry];
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <Scene />
    </svg>
  );
};
