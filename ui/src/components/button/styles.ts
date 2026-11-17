import styled, { css, keyframes } from "styled-components";

import type { ButtonSize, ButtonStyleProps, ButtonVariant } from "./types";
import type { DefaultTheme } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const sizes: Record<ButtonSize, { mobile: string; desktop: string; padding: string; font: string }> = {
  sm: { mobile: "36px", desktop: "32px", padding: "0 12px", font: "13px" },
  md: { mobile: "44px", desktop: "40px", padding: "0 16px", font: "14px" },
  lg: { mobile: "48px", desktop: "48px", padding: "0 20px", font: "16px" }
};

const variants = (theme: DefaultTheme): Record<ButtonVariant, ReturnType<typeof css>> => ({
  primary: css`
    background-color: ${theme.accent.base};
    color: ${theme.accent.contrast};
    font-weight: 700;

    &:hover:not(:disabled) {
      filter: brightness(1.12);
    }
  `,
  secondary: css`
    background-color: ${theme.brand.raised};
    border-color: ${theme.brand.strongBorder};
    color: ${theme.brand.steel};

    &:hover:not(:disabled) {
      border-color: ${theme.brand.steelMuted};
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${theme.brand.steelMuted};

    &:hover:not(:disabled) {
      background-color: ${theme.brand.raised};
      color: ${theme.brand.steel};
    }
  `,
  danger: css`
    background-color: transparent;
    border-color: ${theme.brand.states.errorBorder};
    color: ${theme.brand.states.errorText};

    &:hover:not(:disabled) {
      background-color: ${theme.brand.states.errorSoft};
    }
  `,
  dangerSolid: css`
    background-color: ${theme.brand.states.error};
    color: ${theme.brand.white};
    font-weight: 700;

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  `
});

export const buttonStyles = css<ButtonStyleProps>`
  ${({ theme, $variant, $size, $isFullWidth }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing(2)};
    box-sizing: border-box;
    width: ${$isFullWidth ? "100%" : "auto"};
    height: ${sizes[$size].mobile};
    padding: ${sizes[$size].padding};
    border: 1px solid transparent;
    border-radius: ${theme.radii.control};
    font-family: ${theme.brand.fonts.body};
    font-size: ${sizes[$size].font};
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      border-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      filter ${theme.motion.fast}ms ${theme.motion.easing.standard};

    svg {
      flex-shrink: 0;
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
      height: ${sizes[$size].desktop};
    }

    ${variants(theme)[$variant]}
  `}
`;

export const StyledButton = styled.button<ButtonStyleProps>`
  ${buttonStyles}

  &[aria-busy="true"] {
    cursor: progress;
    opacity: 0.85;
  }
`;

export const Spinner = styled.span`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} ${({ theme }) => theme.motion.loop / 2}ms linear infinite;
`;
