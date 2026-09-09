import { useEffect, useId, useRef } from "react";

// The mark as a living orbit, per the brand story:
//
//   the ring is the orbit    — XEDA's intelligence, circling the business
//   the dot is XEDA, a sparkle — revolving continuously around it
//   the line is the business — held steady, with a pulse always running
//
// XEDA is drawn as the same four-point sparkle as the shipped favicon (two
// small companion sparkles included), so the mark and the browser tab agree
// on what "XEDA" looks like. It carries a radial-gradient shine so it reads
// as a lit, faceted glint rather than a flat dot — depth still comes from
// draw order (see below), the gradient just gives that dot some shimmer.
//
// The orbit plane makes a FULL rotation about the business line's own axis, so
// twice per turn it passes edge-on and momentarily aligns with the line.
//
// That full rotation is why depth is decided here rather than in CSS. The 3D
// read depends on the dot being painted behind the line while it is on the far
// side and in front while it is near — and over a full rotation which half is
// near reverses each half turn. It flips as the plane passes FACE-ON (0deg and
// 180deg), not edge-on: face-on is where the plane is coplanar with the line,
// so every point sits at zero depth and the hand-over is invisible. At edge-on
// (90deg / 270deg) the near half is in fact pointing straight at the viewer.
//
// CSS can animate the orbit and the tilt independently but cannot combine
// their two phases to make that call, so one frame-synced pass does it:
//
//   depth  =  (dot's offset from the rotation axis)  x  sin(tilt angle)
//
// Positive means the dot is on the viewer's side. Everything else — travel,
// trail, glow, the ring, the lifeline — stays declarative in CSS.
//
// Note: this animated instance uses a COMPLETE ellipse, where the static logo
// has a small gap at the dot's resting position — a revolving dot needs an
// unbroken path to travel.
const XedaMarkAnimated = ({ className = "" }: { className?: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const near = svg.querySelector<SVGGElement>(".orbit-dot--near");
    const far = svg.querySelector<SVGGElement>(".orbit-dot--far");
    const plane = svg.querySelector<SVGGElement>(".orbit-plane");
    const probe = svg.querySelector<SVGPathElement>(".orbit-probe");
    if (!near || !far || !plane || !probe) return;

    // Reduced motion: no rAF loop at all, just park the dot in front.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      near.style.visibility = "visible";
      far.style.visibility = "hidden";
      return;
    }

    // A held-open plane (the ambient hero variant) never reverses its near and
    // far halves, so there is nothing to track per frame. Park the sparkle
    // behind the line — at that variant's hairline weight the occlusion is a
    // couple of pixels — and skip the loop entirely.
    if (plane.getAnimations().length === 0) {
      near.style.visibility = "hidden";
      far.style.visibility = "visible";
      return;
    }

    const AXIS_Y = 146; // the business line, in viewBox units
    const pathLen = probe.getTotalLength();
    let frame = 0;
    let running = false;

    const tick = () => {
      if (!running) return;

      // where the dot is along the orbit — read straight off the CSS animation
      const dist = parseFloat(getComputedStyle(near).offsetDistance) || 0;
      const pt = probe.getPointAtLength((dist / 100) * pathLen);

      // how far the plane has turned — also read straight off its animation
      const tilt = plane.getAnimations()[0];
      let deg = 0;
      if (tilt?.effect) {
        const dur = Number(tilt.effect.getTiming().duration) || 1;
        deg = (((Number(tilt.currentTime) || 0) % dur) / dur) * 360;
      }

      const isNear = (pt.y - AXIS_Y) * Math.sin((deg * Math.PI) / 180) > 0;
      near.style.visibility = isNear ? "visible" : "hidden";
      far.style.visibility = isNear ? "hidden" : "visible";

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    // Don't burn frames while the hero is scrolled out of view.
    const io = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    io.observe(svg);

    return () => {
      stop();
      io.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 318 255"
      className={`xeda-orbit ${className}`}
      fill="none"
      stroke="currentColor"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        {/* Off-centre highlight so the sparkle reads as a lit, faceted glint
            rather than a flat currentColor shape. */}
        <radialGradient id={`${gradientId}-shine`} cx="32%" cy="28%" r="80%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.88" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </radialGradient>

        {/* The bloom around the sparkle. A drop-shadow spreads too thin to
            read as light at background scale, so the glow is drawn. */}
        <radialGradient id={`${gradientId}-halo`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="40%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Never painted. This is the geometry the depth maths measures against,
          kept as the same path string the dot travels so the two can never
          disagree. */}
      <path
        className="orbit-probe"
        d="M 258.50 147.19 A 99 105 10 0 1 63.50 112.81 A 99 105 10 0 1 258.50 147.19"
        style={{ display: "none" }}
      />

      {/* Everything in the orbit plane turns together. The business line sits
          OUTSIDE this group — it stays flat and straight while the orbit
          rotates around it. */}
      <g className="orbit-plane">
        <ellipse
          className="orbit-ring"
          cx="161"
          cy="130"
          rx="99"
          ry="105"
          strokeWidth="9"
          transform="rotate(10 161 130)"
        />

        {/* comet trail — faintest and longest first, so brighter layers stack on top */}
        {(["c", "b", "a"] as const).map((layer) => (
          <ellipse
            key={layer}
            className={`orbit-trail orbit-trail--${layer}`}
            pathLength={1}
            cx="161"
            cy="130"
            rx="99"
            ry="105"
            transform="rotate(10 161 130)"
          />
        ))}

        {/* XEDA on the far side — painted before the line, so the line covers it */}
        <OrbitSparkle
          variant="far"
          shineId={`${gradientId}-shine`}
          haloId={`${gradientId}-halo`}
        />
      </g>

      {/* the business */}
      <line
        className="orbit-line"
        x1="18"
        y1="146"
        x2="300"
        y2="146"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* the lifeline: a steady flow along the business */}
      <line
        className="orbit-lifeline"
        pathLength={1}
        x1="18"
        y1="146"
        x2="300"
        y2="146"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* XEDA on the near side — same plane, painted after the line so it
          passes in front */}
      <g className="orbit-plane">
        <OrbitSparkle
          variant="near"
          shineId={`${gradientId}-shine`}
          haloId={`${gradientId}-halo`}
        />
      </g>
    </svg>
  );
};

// XEDA itself: the shipped favicon's four-point sparkle plus its two
// companion accents, traced at the size the orbiting dot used to be. Scale
// and translate are baked into the transform below so the shape sits centred
// on its own origin — the offset-path travel and the depth scale/opacity
// keyframes both pivot around that point.
const SPARKLE_MAIN_D =
  "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z";

const OrbitSparkle = ({
  variant,
  shineId,
  haloId,
}: {
  variant: "near" | "far";
  shineId: string;
  haloId: string;
}) => (
  <g className={`orbit-dot orbit-dot--${variant}`} stroke="none">
    {/* Sits outside the sparkle's own transform group so the two can be sized
        independently — the bloom wants to be much larger than the shape. */}
    <circle className="orbit-halo" r="28" fill={`url(#${haloId})`} />
    <g transform="translate(-12 -12) scale(1.3)">
      <path
        d={SPARKLE_MAIN_D}
        fill={`url(#${shineId})`}
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="0.7"
      />
      {/* companion sparkles — same little "some graphics" flourish as the
          favicon, twinkling on their own faint pulse */}
      <g
        className="orbit-sparkle-accent"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M20 3v4" />
        <path d="M22 5h-4" />
        <path d="M4 17v2" />
        <path d="M5 18H3" />
      </g>
    </g>
  </g>
);

export default XedaMarkAnimated;
