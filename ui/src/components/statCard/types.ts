import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  isTextValue?: boolean;
}
