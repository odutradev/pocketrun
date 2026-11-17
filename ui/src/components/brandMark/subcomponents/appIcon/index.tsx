import { useTheme } from "styled-components";

import type { SymbolVariant } from "@utils/types/brand";

import BrandSymbol from "../symbol";
import { Tile } from "./styles";
import type { AppIconProps } from "./types";

const variantForSize = (size: number): SymbolVariant => (size <= 32 ? "tiny" : size <= 64 ? "bold" : "full");

const AppIcon = ({ size, palette = "dark", context = "general", motion = "none", ...symbolProps }: AppIconProps) => {
  const { motion: timing } = useTheme();

  return (
    <Tile $size={size} $palette={palette} $motion={motion}>
      <BrandSymbol
        size={size * 0.5}
        palette={palette}
        context={context}
        variant={variantForSize(size)}
        {...symbolProps}
        motion={motion}
        motionDelay={timing.base}
      />
    </Tile>
  );
};

export default AppIcon;
