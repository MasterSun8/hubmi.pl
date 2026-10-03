"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Honours prefers-reduced-motion: movement is dropped, fades stay.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
