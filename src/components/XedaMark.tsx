// The XEDA orbit mark, drawn as vector so it stays crisp at every size and
// takes its colour from `currentColor` (one definition for light and dark,
// instead of a separate raster asset per theme).
//
// Geometry traced from the approved brand render: a tilted ellipse with a
// break at the upper right, a satellite dot just outside that break, and a
// horizontal bar running past both edges.
const XedaMark = ({
  className = "",
  strokeWidth = 9,
}: {
  className?: string;
  strokeWidth?: number;
}) => (
  <svg
    viewBox="0 0 318 255"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    role="img"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M 258.9 110.8 A 99 105 10 1 1 243.8 70.5" />
    <line x1="18" y1="146" x2="300" y2="146" />
    <circle cx="263" cy="86" r="13" fill="currentColor" stroke="none" />
  </svg>
);

export default XedaMark;
