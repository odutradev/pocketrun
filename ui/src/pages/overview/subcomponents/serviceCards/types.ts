import type { BrandTool } from "@utils/types/brand";
import type { ReactNode } from "react";

export interface ServiceFact {
  label: string;
  value: string;
}

export interface ServiceCardItem {
  tool: BrandTool;
  name: string;
  description: string;
  icon: ReactNode;
  to: string;
  facts: ServiceFact[];
}

export interface ServiceToolStyleProps {
  $tool: BrandTool;
}
