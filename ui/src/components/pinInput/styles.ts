import styled, { css, keyframes } from "styled-components";

import type { PinBoxStyleProps } from "./types";

const blink = keyframes`
  50% { opacity: 0; }
`;

export const Boxes = styled.div<{ $length: number }>`
  position: relative;
  display: grid;
  grid-template-columns: repeat(${({ $length }) => $length}, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: 336px;
`;

export const Box = styled.div<PinBoxStyleProps>`
  ${({ theme, $isActive, $hasError }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 52px;
    border: 1px solid ${$hasError ? theme.brand.states.error : $isActive ? theme.accent.base : theme.brand.strongBorder};
    border-radius: ${theme.radii.control};
    background-color: ${theme.brand.graphite};
    color: ${theme.brand.steel};
    font-family: ${theme.brand.fonts.mono};
    font-size: 20px;
    font-weight: 500;
    transition:
      border-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      box-shadow ${theme.motion.fast}ms ${theme.motion.easing.standard};

    ${$isActive &&
    css`
      box-shadow:
        inset 0 0 0 1px ${$hasError ? theme.brand.states.error : theme.accent.base},
        0 0 0 4px ${$hasError ? theme.brand.states.errorSoft : theme.accent.soft};
    `}

    @media (min-width: ${theme.breakpoints.md}) {
      height: 48px;
    }
  `}
`;

export const Caret = styled.span`
  width: 1.5px;
  height: 22px;
  background-color: ${({ theme }) => theme.brand.steel};
  animation: ${blink} 1s steps(1) infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Field = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: transparent;
  caret-color: transparent;
  font-size: 16px;
  opacity: 0;
  cursor: text;

  &:disabled {
    cursor: not-allowed;
  }
`;
