import { useRef, type ReactNode } from "react";
import { useScrollDrift } from "@/hooks/useScrollDrift";

/** A layer that drifts against the scroll (see useScrollDrift). */
const Parallax = ({
  children,
  className,
  speed,
  phoneSpeed,
  max,
}: {
  children?: ReactNode;
  className?: string;
  speed?: number;
  phoneSpeed?: number;
  max?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollDrift(ref, { speed, phoneSpeed, max });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default Parallax;
