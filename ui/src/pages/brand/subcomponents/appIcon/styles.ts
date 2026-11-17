import styled from "styled-components";

import type { LogoPalette } from "@utils/types/brand";

export const Tile = styled.span<{ $size: number; $palette: LogoPalette }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size * 0.225}px;
  background-color: ${({ theme, $palette }) =>
    ({
      dark: theme.brand.surface,
      light: theme.brand.paper,
      monoWhite: theme.brand.ink,
      monoInk: theme.brand.white
    })[$palette]};
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.brand.border};
`;
