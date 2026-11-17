import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  titleId?: string;
  isDanger?: boolean;
}
