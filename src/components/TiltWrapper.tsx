import type { ReactNode } from "react";
import { useTilt } from "@/hooks/useTilt";
import { cn } from "@/lib/utils";

interface TiltWrapperProps {
  children: ReactNode;
  className?: string;
  maxDeg?: number;
}

/**
 * Wraps a card in a subtle 3D hover tilt. It's a wrapper (not applied to the card
 * itself) so the card's own transforms — scroll-reveal translate, hover lift —
 * keep working untouched; the tilt composes on top in perspective.
 */
const TiltWrapper = ({ children, className, maxDeg = 5 }: TiltWrapperProps) => {
  const ref = useTilt<HTMLDivElement>(maxDeg);
  return (
    <div ref={ref} className={cn("h-full", className)}>
      {children}
    </div>
  );
};

export default TiltWrapper;
