import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}
