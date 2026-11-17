import styled, { css, keyframes } from "styled-components";

import type { LogoPalette, SymbolMotion } from "@utils/types/brand";

const tileIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: none; opacity: 1; }
`;

export const Tile = styled.span<{ $size: number; $palette: LogoPalette; $motion: SymbolMotion }>`
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

  ${({ theme, $motion }) =>
    $motion === "intro" &&
    css`
      animation: ${tileIn} ${theme.motion.base}ms ${theme.motion.easing.standard} backwards;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    `}
`;
