import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

import type { DefaultTheme } from "styled-components";
import type { CardPadding, CardTone } from "./types";

const paddings: Record<CardPadding, { mobile: number; desktop: number }> = {
  none: { mobile: 0, desktop: 0 },
  sm: { mobile: 3, desktop: 4 },
  md: { mobile: 5, desktop: 6 },
  lg: { mobile: 5, desktop: 7 }
};

const tones = (theme: DefaultTheme): Record<CardTone, ReturnType<typeof css>> => ({
  default: css`
    border: 1px solid ${theme.brand.border};
    background-color: ${theme.brand.surface};
  `,
  dashed: css`
    border: 1px dashed ${theme.brand.strongBorder};
    background-color: transparent;
  `,
  danger: css`
    border: 1px solid ${theme.brand.states.errorBorder};
    background-color: ${theme.brand.surface};
  `
});

const cardStyles = css<{ $tone: CardTone; $padding: CardPadding }>`
  ${({ theme, $tone, $padding }) => css`
    box-sizing: border-box;
    min-width: 0;
    padding: ${theme.spacing(paddings[$padding].mobile)};
    border-radius: ${$padding === "sm" ? theme.radii.panel : theme.radii.card};
    overflow: ${$padding === "none" ? "hidden" : "visible"};
    color: ${theme.brand.steel};
    ${tones(theme)[$tone]}

    @media (min-width: ${theme.breakpoints.md}) {
      padding: ${theme.spacing(paddings[$padding].desktop)};
    }
  `}
`;

export const Surface = styled.div<{ $tone: CardTone; $padding: CardPadding }>`
  ${cardStyles}
`;

export const LinkSurface = styled(Link)<{ $tone: CardTone; $padding: CardPadding }>`
  ${cardStyles}
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition:
    border-color ${({ theme }) => theme.motion.fast}ms ${({ theme }) => theme.motion.easing.standard},
    background-color ${({ theme }) => theme.motion.fast}ms ${({ theme }) => theme.motion.easing.standard};

  &:hover {
    border-color: ${({ theme }) => theme.brand.steelMuted};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 2px;
  }
`;
