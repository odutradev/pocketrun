import type { QrLevel, QrMargin, QrSize } from "@utils/types/link";

export interface QrOptions {
  size: QrSize;
  level: QrLevel;
  margin: QrMargin;
  isTransparent: boolean;
}

export interface QrPreviewStyleProps {
  $isTransparent: boolean;
}
