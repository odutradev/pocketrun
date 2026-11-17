import styled, { css } from "styled-components";

import type { IconButtonSize, IconButtonVariant } from "./types";
import type { DefaultTheme } from "styled-components";

const sizes: Record<IconButtonSize, { mobile: string; desktop: string }> = {
  sm: { mobile: "36px", desktop: "32px" },
  md: { mobile: "44px", desktop: "40px" }
};

const variants = (theme: DefaultTheme): Record<IconButtonVariant, ReturnType<typeof css>> => ({
  ghost: css`
    background-color: transparent;
    color: ${theme.brand.steelMuted};

    &:hover:not(:disabled) {
      background-color: ${theme.brand.raised};
      color: ${theme.brand.steel};
    }
  `,
  secondary: css`
    background-color: ${theme.brand.raised};
    border-color: ${theme.brand.border};
    color: ${theme.brand.steel};

    &:hover:not(:disabled) {
      border-color: ${theme.brand.steelMuted};
    }
  `,
  danger: css`
    background-color: transparent;
    color: ${theme.brand.states.errorText};

    &:hover:not(:disabled) {
      background-color: ${theme.brand.states.errorSoft};
    }
  `
});

export const StyledIconButton = styled.button<{ $variant: IconButtonVariant; $size: IconButtonSize }>`
  ${({ theme, $variant, $size }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: ${sizes[$size].mobile};
    height: ${sizes[$size].mobile};
    padding: 0;
    border: 1px solid transparent;
    border-radius: ${theme.radii.small};
    cursor: pointer;
    transition:
      background-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    svg {
      width: 16px;
      height: 16px;
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      width: ${sizes[$size].desktop};
      height: ${sizes[$size].desktop};
    }

    ${variants(theme)[$variant]}
  `}
`;
