import type { AriaRole, ReactNode } from "react";

export interface VisuallyHiddenProps {
  children: ReactNode;
  role?: AriaRole;
}
