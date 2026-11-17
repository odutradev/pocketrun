import type { BrandContext, LogoPalette } from "@utils/types/brand";
import type { SymbolMotionProps } from "../symbol/types";

export type BrandLogoLayout = "horizontal" | "stacked" | "wordmark";

export interface BrandLogoProps extends SymbolMotionProps {
  size: number;
  layout?: BrandLogoLayout;
  context?: BrandContext;
  palette?: LogoPalette;
}
