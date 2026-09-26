import type React from "react";
// The numbered heading over each of the three stages — 1 Before Xeda,
// 2 Activate Xeda, 3 After Xeda — so the flow reads before anything moves.
// The step marker takes its state colour from the scene (see index.css).
const StageHead = ({ n, title, sub, center = false, aside }: {
  n: 1 | 2 | 3;
  title: string;
  sub: React.ReactNode;
  center?: boolean;
  aside?: React.ReactNode;
}) => (
  <div className={`ix-stagehead ix-stagehead--${n} ${center ? "ix-stagehead--center" : ""}`}>
    <span className="ix-step" aria-hidden="true">{n}</span>
    <span className="min-w-0">
      <span className="ix-stagehead-title">{title}</span>
      <span className="ix-stagehead-sub">{sub}</span>
    </span>
    {aside}
  </div>
);

export default StageHead;
