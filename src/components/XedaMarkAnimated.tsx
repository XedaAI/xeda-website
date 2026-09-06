// The mark drawn as a three-beat sequence, in the order the brand story tells it:
//
//   1. the ring draws itself around      — XEDA surrounds the business
//   2. the line runs straight through    — it streamlines operations
//   3. the point lands and pulses        — and transforms them into outcomes
//
// This is a stroke-built copy of the traced mark rather than the filled outline
// used in the nav: filled paths cannot "draw", and stroke-dashoffset can. The
// geometry is measured from the same artwork, so the two read as one mark.
//
// pathLength="1" normalises each path so the dash offsets are plain 0→1
// fractions instead of magic numbers tied to the viewBox.
const XedaMarkAnimated = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 318 255"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={9}
    strokeLinecap="round"
    role="presentation"
    aria-hidden="true"
  >
    {/* 1 — the ring: XEDA, surrounding */}
    <path
      className="mark-ring"
      pathLength={1}
      d="M 258.9 110.8 A 99 105 10 1 1 243.8 70.5"
    />
    {/* 2 — the line: the business, made straight */}
    <line className="mark-line" pathLength={1} x1="18" y1="146" x2="300" y2="146" />
    {/* 3 — the point: transformation, where the value lands */}
    <circle className="mark-star" cx="263" cy="86" r="13" fill="currentColor" stroke="none" />
  </svg>
);

export default XedaMarkAnimated;
