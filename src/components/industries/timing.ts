import type React from "react";

// Shared choreography for the industries scene. Every animated element gets a
// `--d` (its delay in ms from the click); the CSS in index.css ("Industries")
// turns it into transition delays.

export const delay = (ms: number) => ({ "--d": ms }) as React.CSSProperties;

/** When output row i starts filling, in ms from the click. */
export const rowAt = (i: number) => 1150 + i * 150;
