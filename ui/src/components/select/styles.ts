import styled from "styled-components";

import { fieldControlStyles } from "@components/formField/styles";
import type { FieldControlStyleProps } from "@components/formField/types";

export const Control = styled.div<FieldControlStyleProps>`
  ${fieldControlStyles}
  position: relative;
  display: flex;
  align-items: center;
  height: 44px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 40px;
  }
`;

export const Field = styled.select`
  flex: 1;
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing(10)} 0 ${({ theme }) => theme.spacing(3)};
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  appearance: none;
  outline: none;
  cursor: pointer;

  option {
    background-color: ${({ theme }) => theme.brand.raised};
    color: ${({ theme }) => theme.brand.steel};
  }
`;

export const Chevron = styled.span`
  position: absolute;
  right: ${({ theme }) => theme.spacing(3)};
  display: inline-flex;
  color: ${({ theme }) => theme.brand.steelMuted};
  pointer-events: none;
`;
