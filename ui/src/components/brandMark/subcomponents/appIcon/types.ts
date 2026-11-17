import type { BrandContext, LogoPalette } from "@utils/types/brand";

import type { SymbolMotionProps } from "../symbol/types";

export interface AppIconProps extends SymbolMotionProps {
  size: number;
  palette?: LogoPalette;
  context?: BrandContext;
}
