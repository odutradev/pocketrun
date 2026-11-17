import styled, { css } from "styled-components";

import type { ColumnAlign } from "./types";

export const ScrollBox = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
`;

export const Table = styled.table<{ $minWidth: string }>`
  width: 100%;
  min-width: ${({ $minWidth }) => $minWidth};
  border-collapse: collapse;
  font-size: 14px;
`;

export const Caption = styled.caption`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

export const HeaderCell = styled.th<{ $align: ColumnAlign }>`
  padding: ${({ theme }) => `${theme.spacing(2.5)} ${theme.spacing(3.5)}`};
  background-color: ${({ theme }) => theme.brand.raised};
  color: ${({ theme }) => theme.brand.steelMuted};
  font-weight: 600;
  text-align: ${({ $align }) => $align};
  white-space: nowrap;
`;

export const Row = styled.tr<{ $isSelected: boolean; $isSelectable: boolean }>`
  ${({ theme, $isSelected, $isSelectable }) => css`
    border-top: 1px solid ${theme.brand.border};
    background-color: ${$isSelected ? theme.accent.soft : "transparent"};
    box-shadow: ${$isSelected ? `inset 3px 0 0 ${theme.accent.base}` : "none"};
    transition: background-color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    ${$isSelectable &&
    css`
      cursor: pointer;

      &:hover {
        background-color: ${$isSelected ? theme.accent.soft : theme.brand.raised};
      }

      &:focus-visible {
        outline: 2px solid ${theme.accent.base};
        outline-offset: -2px;
      }
    `}
  `}
`;

export const Cell = styled.td<{ $align: ColumnAlign }>`
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(3.5)}`};
  text-align: ${({ $align }) => $align};
  vertical-align: middle;
`;
