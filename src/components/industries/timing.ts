import type React from "react";

// Shared choreography for the industries scene. Every animated element gets a
// `--d` (its delay in ms from the click); the CSS in index.css ("Industries")
// turns it into transition delays.

export const delay = (ms: number) => ({ "--d": ms }) as React.CSSProperties;

/** When output row i starts filling, in ms from the click. */
export const rowAt = (i: number) => 1150 + i * 150;

/** Phones: when result row i starts to appear, in ms from the end of the
 *  scan (the phone result builds up only once the scan has finished). */
export const mRowAt = (i: number) => 220 + i * 110;

/** How long a full run takes before it settles, desktop and phone. */
export const RUN_MS = { desktop: 3000, phone: 1900 };
