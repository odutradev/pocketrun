import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  isCompact?: boolean;
}
