import styled, { css } from "styled-components";

import type { ApiStatusVariant } from "./types";

export const Container = styled.div<{ $variant: ApiStatusVariant }>`
  ${({ theme, $variant }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing(2.5)};
    border: 1px solid ${theme.brand.border};
    font-size: 14px;
    color: ${theme.brand.steelMuted};

    ${$variant === "pill"
      ? css`
          padding: ${theme.spacing(2)} ${theme.spacing(3)};
          border-radius: ${theme.radii.pill};
        `
      : css`
          padding: ${theme.spacing(3.5)} ${theme.spacing(4)};
          border-radius: ${theme.radii.box};
          background-color: ${theme.brand.surface};
        `}
  `}
`;

export const Dot = styled.span<{ $isOnline: boolean }>`
  ${({ theme, $isOnline }) => css`
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${$isOnline ? theme.brand.states.success : theme.brand.states.error};
    box-shadow: 0 0 0 3px ${$isOnline ? theme.brand.states.successSoft : theme.brand.states.errorSoft};
  `}
`;

export const Address = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  overflow-wrap: anywhere;
`;
