import styled, { css } from "styled-components";

import type { FieldControlStyleProps } from "./types";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  min-width: 0;
`;

export const Label = styled.label<{ $isHidden: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};

  ${({ $isHidden }) =>
    $isHidden &&
    css`
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    `}
`;

export const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const ErrorText = styled.p`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.states.errorText};

  svg {
    flex-shrink: 0;
  }
`;

export const fieldControlStyles = css<FieldControlStyleProps>`
  ${({ theme, $hasError, $isMono }) => css`
    box-sizing: border-box;
    width: 100%;
    border: 1px solid ${$hasError ? theme.brand.states.error : theme.brand.strongBorder};
    border-radius: ${theme.radii.control};
    background-color: ${theme.brand.graphite};
    color: ${theme.brand.steel};
    font-family: ${$isMono ? theme.brand.fonts.mono : theme.brand.fonts.body};
    font-size: ${$isMono ? "14px" : "15px"};
    transition:
      border-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      box-shadow ${theme.motion.fast}ms ${theme.motion.easing.standard};

    &:hover {
      border-color: ${$hasError ? theme.brand.states.error : theme.brand.steelMuted};
    }

    &:focus-within {
      border-color: ${$hasError ? theme.brand.states.error : theme.accent.base};
      box-shadow:
        inset 0 0 0 1px ${$hasError ? theme.brand.states.error : theme.accent.base},
        0 0 0 4px ${$hasError ? theme.brand.states.errorSoft : theme.accent.soft};
    }

    &:has(:disabled) {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;
