import { useEffect, useId, useRef, type CSSProperties } from "react";

// The mark as a living orbit, per the brand story:
//
//   the ring is the orbit    — XEDA's intelligence, circling the business
//   the comet is XEDA        — revolving continuously around it
//   the line is the business — held steady, with a pulse always running
//
// Drawn here at hero-background scale, the business line becomes a horizon
// below the copy and the orbit a ring turning slowly around it in 3D, with a
// quieter ring inside and outside so the whole reads as an orbital SYSTEM
// rather than one lone circle. All three share the same axis — the business
// line — but turn at their own pace and direction, so the scene is never
// flat: when one ring passes edge-on another is open.
//
// XEDA is a comet: a small lit sphere (a circle shaded with an off-centre
// radial gradient, plus a drawn bloom) with a long luminous tail along the
// orbit behind it. The tail is three dashes of the ring itself, so it lies in
// the orbit plane and foreshortens with it; the head is a ball, so it must NOT
// — it is drawn outside the plane and placed per frame at the projected
// position of its point on the orbit (see below), which keeps it round and
// vector-sharp however the plane is turned.
//
// Depth is decided here rather than in CSS. The 3D read depends on the head
// being painted behind the line while it is on the far side and in front
// while it is near — and over a full rotation which half is near reverses
// each half turn as the plane passes face-on. Face-on is where the plane is
// coplanar with the line, so every point sits at zero depth and the hand-over
// is invisible. CSS animates the travel and the tilt independently but cannot
// combine the two phases, so one frame-synced pass reads the plane's current
// transform matrix, projects the head's point through it, and derives:
//
//   position  — where to draw the head (in root SVG coordinates)
//   depth     — its z after projection, normalised to [-1, 1], handed to CSS
//               as --orbit-depth so size and weight follow true distance
//   near/far  — which of the two copies (before/after the line) is shown
//
// Everything else — travel, tail, rings, the lifeline — stays declarative in
// CSS.
//
// Note: this animated instance uses a COMPLETE ellipse, where the static logo
// has a small gap at the comet's resting position — a revolving comet needs an
// unbroken path to travel.

// --- Scene geometry, in viewBox units -----------------------------------
// Drawn at 1440 wide so that on a desktop viewport one unit is one CSS pixel,
// which keeps the sizes below easy to reason about. The scene is anchored to
// the bottom of the hero and scales with width.
const VIEW_W = 1440;
const VIEW_H = 660;
const AXIS_Y = 475; // the business line — the horizon everything orbits
const CX = VIEW_W / 2; // must stay at 50%: the planes pivot on the viewBox centre
const TILT = 7; // degrees, echoing the logo's tilted ring

// Drawn FACE-ON, which is the tallest the rings ever get: the tilt only ever
// flattens them from here. Ovals rather than the logo's near-circle so the
// system can sit behind the paragraph and CTAs without climbing into the
// headline. The middle ring is the orbit XEDA actually rides.
const RINGS = {
  inner: { rx: 250, ry: 118 },
  main: { rx: 350, ry: 175 },
  outer: { rx: 470, ry: 205 },
} as const;

// The business line runs well past the outer ring, as in the logo, and is
// feathered at both ends in CSS.
const LINE_HALF = 620;

const RAD = (TILT * Math.PI) / 180;
const f = (n: number) => n.toFixed(2);

// A point on a tilted ellipse at parametric angle phi (degrees).
const onRing = ({ rx, ry }: { rx: number; ry: number }, phi: number) => {
  const p = (phi * Math.PI) / 180;
  const x = rx * Math.cos(p);
  const y = ry * Math.sin(p);
  return {
    x: CX + x * Math.cos(RAD) - y * Math.sin(RAD),
    y: AXIS_Y + x * Math.sin(RAD) + y * Math.cos(RAD),
  };
};

// The orbit as a path, starting at the right-hand end of the major axis and
// sweeping clockwise on screen, so 25% of the way round is the BOTTOM and 75%
// the TOP. Shared by the ring, the offset-path the travel clock runs along
// and the probe the depth maths measures against, so they can never disagree.
const right = onRing(RINGS.main, 0);
const left = onRing(RINGS.main, 180);
const { rx: MRX, ry: MRY } = RINGS.main;
const ORBIT_PATH =
  `M ${f(right.x)} ${f(right.y)} ` +
  `A ${MRX} ${MRY} ${TILT} 0 1 ${f(left.x)} ${f(left.y)} ` +
  `A ${MRX} ${MRY} ${TILT} 0 1 ${f(right.x)} ${f(right.y)}`;

// Where the comet parks when motion is off: the right-hand end of the orbit,
// a little above the horizon as in the static logo, and clear of the copy.
const rest = onRing(RINGS.main, -15);

const sceneVars = {
  "--orbit-path": `path("${ORBIT_PATH}")`,
  "--orbit-rest": `translate(${f(rest.x)}px, ${f(rest.y)}px)`,
  // where the planes pivot: the horizon, as a fraction of the viewBox height
  "--orbit-axis": `${f((AXIS_Y / VIEW_H) * 100)}%`,
} as CSSProperties;

const XedaMarkAnimated = ({ className = "" }: { className?: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const near = svg.querySelector<SVGGElement>(".orbit-dot--near");
    const far = svg.querySelector<SVGGElement>(".orbit-dot--far");
    const plane = svg.querySelector<SVGGElement>(".orbit-plane--main");
    const probe = svg.querySelector<SVGPathElement>(".orbit-probe");
    if (!near || !far || !plane || !probe) return;

    // Reduced motion, or no offset-path to read a clock from: no rAF loop at
    // all, just park the comet in front at its resting position (the CSS
    // default for --orbit-pos).
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !CSS.supports("offset-path", 'path("M 0 0 L 1 1")')
    ) {
      near.style.visibility = "visible";
      far.style.visibility = "hidden";
      return;
    }

    const pathLen = probe.getTotalLength();
    let frame = 0;
    let running = false;

    const tick = () => {
      if (!running) return;

      // where the comet is along the orbit — read straight off the CSS
      // animation of the (never painted) probe
      const dist = parseFloat(getComputedStyle(probe).offsetDistance) || 0;
      const pt = probe.getPointAtLength((dist / 100) * pathLen);

      // how the plane is currently turned — its animated transform, exactly
      // as rendered. The matrix is about the plane's transform-origin, which
      // sits on the horizon at the viewBox centre.
      const m = new DOMMatrix(getComputedStyle(plane).transform);
      const p = m.transformPoint(new DOMPoint(pt.x - CX, pt.y - AXIS_Y, 0, 1));
      const w = p.w || 1;
      const x = CX + p.x / w;
      const y = AXIS_Y + p.y / w;
      // CSS z points at the viewer, so positive is the near side. Normalised
      // against the ring's half-height, which is the furthest any point on
      // the orbit can be from the axis.
      const depth = Math.max(-1, Math.min(1, p.z / w / MRY));

      const isNear = depth > 0;
      near.style.visibility = isNear ? "visible" : "hidden";
      far.style.visibility = isNear ? "hidden" : "visible";

      const pos = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      const d = depth.toFixed(3);
      for (const el of [near, far]) {
        el.style.setProperty("--orbit-pos", pos);
        el.style.setProperty("--orbit-depth", d);
      }

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

  const ringProps = (ring: { rx: number; ry: number }) => ({
    cx: CX,
    cy: AXIS_Y,
    rx: ring.rx,
    ry: ring.ry,
    transform: `rotate(${TILT} ${CX} ${AXIS_Y})`,
  });

  const cometIds = { shineId: `${gradientId}-shine`, haloId: `${gradientId}-halo` };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={`xeda-orbit ${className}`}
      style={sceneVars}
      fill="none"
      stroke="currentColor"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        {/* The comet head as a lit ball: highlight up and to the left, the
            rim falling away into the dark. Drawn with a gradient rather than
            a filter so it stays sharp at any size. */}
        <radialGradient id={cometIds.shineId} cx="36%" cy="32%" r="68%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="38%" stopColor="currentColor" stopOpacity="0.92" />
          <stop offset="72%" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.22" />
        </radialGradient>

        {/* The bloom around the head. A drop-shadow spreads too thin to read
            as light at background scale, so the glow is drawn. */}
        <radialGradient id={cometIds.haloId}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="35%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Never painted. It carries the travel clock (the offset-path
          animation) and is the geometry the depth maths measures against —
          the same path string the ring is drawn from, so the two can never
          disagree. Hidden, not display:none, so its animation still runs. */}
      <path className="orbit-probe" d={ORBIT_PATH} style={{ visibility: "hidden" }} />

      {/* The three orbit planes, each turning about the business line at its
          own pace. The line itself sits OUTSIDE these groups — it stays flat
          and straight while the orbits revolve around it. */}
      <g className="orbit-plane orbit-plane--outer">
        <ellipse
          className="orbit-ring orbit-ring--outer"
          pathLength={1}
          {...ringProps(RINGS.outer)}
        />
      </g>
      <g className="orbit-plane orbit-plane--inner">
        <ellipse className="orbit-ring orbit-ring--inner" {...ringProps(RINGS.inner)} />
      </g>
      <g className="orbit-plane orbit-plane--main">
        <ellipse className="orbit-ring orbit-ring--main" strokeWidth="9" {...ringProps(RINGS.main)} />

        {/* comet tail — faintest and longest first, so brighter layers stack
            on top and the tail tapers towards the head */}
        {(["c", "b", "a"] as const).map((layer) => (
          <ellipse
            key={layer}
            className={`orbit-trail orbit-trail--${layer}`}
            pathLength={1}
            {...ringProps(RINGS.main)}
          />
        ))}
      </g>

      {/* XEDA on the far side — painted before the line, so the line covers it */}
      <CometHead variant="far" {...cometIds} />

      {/* the business — the horizon */}
      <line
        className="orbit-line"
        x1={CX - LINE_HALF}
        y1={AXIS_Y}
        x2={CX + LINE_HALF}
        y2={AXIS_Y}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* the lifeline: a steady flow along the business */}
      <line
        className="orbit-lifeline"
        pathLength={1}
        x1={CX - LINE_HALF}
        y1={AXIS_Y}
        x2={CX + LINE_HALF}
        y2={AXIS_Y}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* XEDA on the near side — painted after the line so it passes in front */}
      <CometHead variant="near" {...cometIds} />
    </svg>
  );
};

// The comet's head: a small sphere and its bloom, both centred on the group's
// own origin so the per-frame translate and the depth scale pivot around the
// same point.
const CometHead = ({
  variant,
  shineId,
  haloId,
}: {
  variant: "near" | "far";
  shineId: string;
  haloId: string;
}) => (
  <g className={`orbit-dot orbit-dot--${variant}`} stroke="none">
    <circle className="orbit-halo" r="46" fill={`url(#${haloId})`} />
    <circle className="orbit-head" r="6.5" fill={`url(#${shineId})`} />
  </g>
);

export default XedaMarkAnimated;
