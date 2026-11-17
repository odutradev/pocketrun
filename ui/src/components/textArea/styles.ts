import styled from "styled-components";

import { fieldControlStyles } from "@components/formField/styles";

import type { FieldControlStyleProps } from "@components/formField/types";

export const Field = styled.textarea<FieldControlStyleProps>`
  ${fieldControlStyles}
  display: block;
  min-height: 88px;
  padding: ${({ theme }) => theme.spacing(3)};
  line-height: 1.5;
  resize: vertical;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.brand.steelMuted};
    opacity: 0.7;
  }
`;
