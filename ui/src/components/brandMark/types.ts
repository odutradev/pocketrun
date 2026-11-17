import type { LogoKind } from "@utils/types/brand";

import type { BrandSymbolProps } from "./subcomponents/symbol/types";

export interface BrandMarkProps extends BrandSymbolProps {
  kind?: LogoKind;
  hasContextTransition?: boolean;
  isHoverable?: boolean;
}
