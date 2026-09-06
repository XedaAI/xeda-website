// The mark as a living orbit, per the brand story:
//
//   the ring is the orbit          — XEDA's intelligence, circling the business
//   the dot is XEDA                — revolving continuously around it
//   the line is the business       — held steady, and quickened as XEDA passes
//
// The 3D read comes from occlusion, not from perspective maths: the dot is
// drawn TWICE, once before the line and once after it. The "far" copy is
// painted underneath the line and is only visible across the back half of the
// orbit; the "near" copy sits on top of the line and shows across the front
// half. They hand over at the two points where the orbit crosses the line's
// plane, where both copies share the same size and opacity — so it reads as
// one dot passing behind and then in front.
//
// Radius and opacity breathe with depth (smaller and dimmer at the back,
// larger and brighter at the front), which is what makes a flat ellipse feel
// like something going around.
//
// Note: this animated instance uses a COMPLETE ellipse, where the static logo
// has a small gap at the dot's resting position — a revolving dot needs an
// unbroken path to travel.
const XedaMarkAnimated = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 318 255"
    className={`xeda-orbit ${className}`}
    fill="none"
    stroke="currentColor"
    role="presentation"
    aria-hidden="true"
  >
    {/* the orbit itself */}
    <ellipse
      className="orbit-ring"
      cx="161"
      cy="130"
      rx="99"
      ry="105"
      strokeWidth="9"
      transform="rotate(10 161 130)"
    />

    {/* XEDA on the far side — painted before the line, so the line covers it */}
    <circle className="orbit-dot orbit-dot--far" r="13" fill="currentColor" stroke="none" />

    {/* the business: steady, and brightening each time XEDA comes past */}
    <line className="orbit-line" x1="18" y1="146" x2="300" y2="146" strokeWidth="9" strokeLinecap="round" />

    {/* XEDA on the near side — painted after the line, so it passes in front */}
    <circle className="orbit-dot orbit-dot--near" r="13" fill="currentColor" stroke="none" />
  </svg>
);

export default XedaMarkAnimated;
