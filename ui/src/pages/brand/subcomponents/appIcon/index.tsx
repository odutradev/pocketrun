import BrandSymbol from "@components/brandSymbol";
import type { SymbolVariant } from "@utils/types/brand";

import { Tile } from "./styles";
import type { AppIconProps } from "./types";

const variantForSize = (size: number): SymbolVariant => (size <= 32 ? "tiny" : size <= 64 ? "bold" : "full");

const AppIcon: React.FC<AppIconProps> = ({ size, palette = "dark", context = "geral" }) => (
  <Tile $size={size} $palette={palette}>
    <BrandSymbol size={size * 0.5} palette={palette} context={context} variant={variantForSize(size)} />
  </Tile>
);

export default AppIcon;
