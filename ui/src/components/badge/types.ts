import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error";

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  hasDot?: boolean;
  isMono?: boolean;
}
