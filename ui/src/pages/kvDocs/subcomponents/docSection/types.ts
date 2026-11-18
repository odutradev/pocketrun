import type { ReactNode } from "react";

export interface DocSectionProps {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}
