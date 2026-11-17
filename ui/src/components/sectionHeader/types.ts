import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  // Id do título, para `aria-labelledby` na seção.
  titleId?: string;
  isDanger?: boolean;
}
