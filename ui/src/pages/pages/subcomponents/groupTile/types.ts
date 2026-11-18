import type { GroupColor, GroupIcon } from "@utils/types/sitePage";

export type GroupTileSize = "sm" | "md";

export interface GroupTileProps {
  color: GroupColor;
  icon: GroupIcon;
  size?: GroupTileSize;
}

export interface TileStyleProps {
  $color: GroupColor;
  $size: GroupTileSize;
}
