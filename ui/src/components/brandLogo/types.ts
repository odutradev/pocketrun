import type { BrandContext, LogoPalette } from "@utils/types/brand";

export type BrandLogoLayout = "horizontal" | "stacked" | "wordmark";

export interface BrandLogoProps {
  size: number;
  layout?: BrandLogoLayout;
  context?: BrandContext;
  palette?: LogoPalette;
}
