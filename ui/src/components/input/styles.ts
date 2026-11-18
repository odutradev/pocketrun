import styled from "styled-components";

import { fieldControlStyles } from "@components/formField/styles";

import type { FieldControlStyleProps } from "@components/formField/types";
import type { InputSize } from "./types";

const heights: Record<InputSize, { mobile: string; desktop: string }> = {
  sm: { mobile: "36px", desktop: "32px" },
  md: { mobile: "44px", desktop: "40px" },
  lg: { mobile: "48px", desktop: "48px" }
};

export const Control = styled.div<FieldControlStyleProps & { $size: InputSize }>`
  ${fieldControlStyles}
  display: flex;
  align-items: stretch;
  overflow: hidden;
  height: ${({ $size }) => heights[$size].mobile};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: ${({ $size }) => heights[$size].desktop};
  }
`;

export const Prefix = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  border-right: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.raised};
  color: ${({ theme }) => theme.brand.steelMuted};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
`;

export const Icon = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding-left: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Field = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.brand.steelMuted};
    opacity: 0.7;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: ${({ theme }) => theme.brand.steel};
    caret-color: ${({ theme }) => theme.brand.steel};
    transition: background-color 600000s 0s, color 600000s 0s;
  }
`;

export const Trailing = styled.span`
  display: inline-flex;
  align-items: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;
