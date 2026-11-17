import type { BrandSymbolProps } from "./subcomponents/symbol/types";
import type { LogoKind } from "@utils/types/brand";

export interface BrandMarkProps extends BrandSymbolProps {
  kind?: LogoKind;
  hasContextTransition?: boolean;
  isHoverable?: boolean;
}
