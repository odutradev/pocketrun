import styled, { css, keyframes } from "styled-components";

import type { SymbolMotion } from "@utils/types/brand";

import type { BrandLogoLayout } from "./types";

const letterRise = keyframes`
  from { transform: translateY(0.35em); opacity: 0; }
  to { transform: none; opacity: 1; }
`;

const letterPop = keyframes`
  from { transform: scale(0.6); opacity: 0; }
  to { transform: none; opacity: 1; }
`;

export const Wrapper = styled.span<{ $layout: BrandLogoLayout; $size: number }>`
  display: inline-flex;
  flex-direction: ${({ $layout }) => ($layout === "stacked" ? "column" : "row")};
  align-items: center;
  gap: ${({ $layout, $size }) => ($layout === "stacked" ? $size * 0.42 : $size * 0.36)}px;
`;

export const Wordmark = styled.span<{ $size: number; $color: string }>`
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: ${({ $size }) => $size}px;
  line-height: 1;
  letter-spacing: -0.035em;
  white-space: nowrap;
  color: ${({ $color }) => $color};
  transition: color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};
`;

export const Letter = styled.span<{ $color?: string; $motion: SymbolMotion; $delay: number; $isRun: boolean }>`
  color: ${({ $color }) => $color};
  transition: color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  ${({ theme, $motion, $delay, $isRun }) =>
    $motion === "intro" &&
    css`
      display: inline-block;
      animation: ${$isRun ? letterPop : letterRise}
        ${$isRun ? `${theme.motion.expressive}ms ${theme.motion.easing.snap}` : `${theme.motion.base}ms ${theme.motion.easing.standard}`}
        ${$delay}ms backwards;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    `}
`;
