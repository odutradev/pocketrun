import { StackIcon } from "@radix-ui/react-icons";
import { useTheme } from "styled-components";

import { defaultGroupAppearance } from "@assets/config";
import { groupIconOptions } from "@assets/data";
import { Tile } from "./styles";

import type { GroupTileProps } from "./types";

const GroupTile = ({ color, icon, size = "md" }: GroupTileProps) => {
  const { brand } = useTheme();
  const Icon = groupIconOptions.find((option) => option.value === icon)?.icon ?? StackIcon;
  const tileColor = color in brand.groups ? color : defaultGroupAppearance.color;

  return (
    <Tile $color={tileColor} $size={size} aria-hidden="true">
      <Icon />
    </Tile>
  );
};

export default GroupTile;
