import { Select as RadixSelect } from "@radix-ui/themes";
import styled, { css } from "styled-components";

import { fieldControlStyles } from "@components/formField/styles";

import type { FieldControlStyleProps } from "@components/formField/types";

export const Control = styled.div<FieldControlStyleProps>`
  ${fieldControlStyles}
  display: flex;
  align-items: stretch;
  height: 44px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 40px;
  }
`;

export const Trigger = styled(RadixSelect.Trigger)`
  ${({ theme }) => css`
    && {
      flex: 1;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0 ${theme.spacing(3)};
      border-radius: ${theme.radii.control};
      background: transparent;
      box-shadow: none;
      color: ${theme.brand.steel};
      font-family: ${theme.brand.fonts.body};
      font-size: 15px;
      justify-content: space-between;
      cursor: pointer;
      outline: none;
    }

    &&:hover {
      background: transparent;
    }

    &&[data-placeholder] {
      color: ${theme.brand.steelMuted};
    }

    && svg {
      color: ${theme.brand.steelMuted};
    }
  `}
`;

export const Content = styled(RadixSelect.Content)`
  ${({ theme }) => css`
    && {
      min-width: var(--radix-select-trigger-width);
      border: 1px solid ${theme.brand.strongBorder};
      border-radius: ${theme.radii.control};
      background-color: ${theme.brand.surface};
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    }
  `}
`;

export const Item = styled(RadixSelect.Item)`
  ${({ theme }) => css`
    && {
      height: 36px;
      padding-left: ${theme.spacing(7)};
      border-radius: ${theme.radii.small};
      color: ${theme.brand.steel};
      font-family: ${theme.brand.fonts.body};
      font-size: 14px;
      cursor: pointer;
    }

    &&[data-highlighted] {
      background-color: ${theme.brand.raised};
      color: ${theme.brand.steel};
    }

    &&[data-state="checked"] {
      font-weight: 600;
    }

    && .rt-SelectItemIndicator {
      color: ${theme.accent.text};
    }
  `}
`;
