import styled from "styled-components";

import type { TileStyleProps } from "./types";

export const Tile = styled.span<TileStyleProps>`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${({ theme, $size }) => theme.spacing($size === "sm" ? 9 : 10)};
  height: ${({ theme, $size }) => theme.spacing($size === "sm" ? 9 : 10)};
  border-radius: ${({ theme }) => theme.radii.control};
  background-color: ${({ theme, $color }) => theme.brand.groups[$color].soft};
  color: ${({ theme, $color }) => theme.brand.groups[$color].text};
  transition:
    background-color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`},
    color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  svg {
    width: ${({ $size }) => ($size === "sm" ? "16px" : "18px")};
    height: ${({ $size }) => ($size === "sm" ? "16px" : "18px")};
  }
`;
