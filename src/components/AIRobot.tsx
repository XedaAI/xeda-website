import { CSSProperties } from "react";
import { useMouseParallax } from "@/hooks/useMouseParallax";

// Static assembled part (kept as a helper so the shapes stay tidy). The dramatic
// scroll-burst was intentionally removed — for a conservative DACH B2B audience the
// robot should read as a calm, faint background accent, not a gimmick. It now only
// floats gently and drifts subtly toward the cursor.
const part = (..._args: number[]): CSSProperties => ({});

interface AIRobotProps {
  className?: string;
}

/**
 * Decorative AI robot for the hero background — deliberately understated: a gentle
 * idle float and a subtle cursor drift only. Purely decorative (aria-hidden); all
 * motion respects prefers-reduced-motion.
 */
const AIRobot = ({ className }: AIRobotProps) => {
  const mouseRef = useMouseParallax<HTMLDivElement>(6);

  return (
    <div ref={mouseRef} className={className} aria-hidden="true">
      <div className="robot-float">
        <svg
          viewBox="0 0 120 150"
          className="w-[clamp(280px,48vw,560px)] h-auto drop-shadow-[0_0_28px_hsl(var(--primary)/0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Antenna (stalk + tip share one offset) */}
          <line className="robot-part" style={part(0, -95)} x1="60" y1="26" x2="60" y2="14" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" />
          <circle className="robot-part" style={part(0, -95)} cx="60" cy="11" r="4" fill="hsl(var(--primary-foreground))" />

          {/* Head */}
          <rect className="robot-part" style={part(0, -80, -8)} x="36" y="26" width="48" height="38" rx="11" fill="hsl(var(--primary))" />

          {/* Eyes */}
          <circle className="robot-part" style={part(-58, -58)} cx="50" cy="44" r="5" fill="hsl(var(--primary-foreground))" />
          <circle className="robot-part" style={part(58, -58)} cx="70" cy="44" r="5" fill="hsl(var(--primary-foreground))" />

          {/* Mouth / speaker grille */}
          <rect className="robot-part" style={part(0, -34, 6)} x="50" y="53" width="20" height="4" rx="2" fill="hsl(var(--primary-foreground) / 0.7)" />

          {/* Arms */}
          <rect className="robot-part" style={part(-120, -8, -22)} x="26" y="70" width="9" height="28" rx="4.5" fill="hsl(var(--primary))" />
          <rect className="robot-part" style={part(120, -8, 22)} x="85" y="70" width="9" height="28" rx="4.5" fill="hsl(var(--primary))" />

          {/* Body */}
          <rect className="robot-part" style={part(0, 22)} x="40" y="68" width="40" height="40" rx="9" fill="hsl(var(--primary))" />

          {/* Chest core + pulsing ring (share one offset) */}
          <circle className="robot-part" style={part(0, 58)} cx="60" cy="88" r="6" fill="hsl(var(--primary-foreground))" />
          <circle className="robot-part" style={part(0, 58)} cx="60" cy="88" r="6" fill="none" stroke="hsl(var(--primary-foreground) / 0.5)" strokeWidth="2">
            <animate attributeName="r" values="6;10;6" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Legs */}
          <rect className="robot-part" style={part(-46, 112)} x="47" y="108" width="9" height="20" rx="4" fill="hsl(var(--primary))" />
          <rect className="robot-part" style={part(46, 112)} x="64" y="108" width="9" height="20" rx="4" fill="hsl(var(--primary))" />
        </svg>
      </div>
    </div>
  );
};

export default AIRobot;
