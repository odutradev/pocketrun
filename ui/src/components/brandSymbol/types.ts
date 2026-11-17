import type { BrandContext, LogoPalette, SymbolVariant } from "@utils/types/brand";

export type SymbolFrame = "tight" | "full";

export interface BrandSymbolProps {
  size: number;
  context?: BrandContext;
  palette?: LogoPalette;
  variant?: SymbolVariant;
  frame?: SymbolFrame;
  title?: string;
}
