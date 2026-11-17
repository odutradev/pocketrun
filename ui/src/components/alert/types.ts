import type { ReactNode } from "react";

export type AlertTone = "neutral" | "success" | "warning" | "error";

export interface AlertProps {
  children: ReactNode;
  tone?: AlertTone;
  title?: string;
  action?: ReactNode;
  isBanner?: boolean;
}
