import type { BrandColor } from "@utils/types/brand";



export type SwatchSize = "regular" | "large";

export interface ColorSwatchProps {
  color: BrandColor;
  size?: SwatchSize;
}
