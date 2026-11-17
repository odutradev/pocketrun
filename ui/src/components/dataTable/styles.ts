import styled, { css } from "styled-components";

import type { CellRole, ColumnAlign } from "./types";

export const ScrollBox = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
`;

export const Table = styled.table<{ $minWidth: string }>`
  ${({ theme, $minWidth }) => css`
    display: block;
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }

    tbody {
      display: block;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      display: table;
      min-width: ${$minWidth};

      thead {
        position: static;
        width: auto;
        height: auto;
        overflow: visible;
        clip: auto;
      }

      tbody {
        display: table-row-group;
      }
    }
  `}
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${theme.spacing(2)} ${theme.spacing(3)};
    padding: ${theme.spacing(3.5)} ${theme.spacing(4)};
    border-top: 1px solid ${theme.brand.border};

    &:first-child {
      border-top: 0;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      display: table-row;
      padding: 0;

      &:first-child {
        border-top: 1px solid ${theme.brand.border};
      }
    }

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

export const Cell = styled.td<{ $align: ColumnAlign; $role: CellRole }>`
  ${({ theme, $align, $role }) => css`
    display: flex;
    grid-column: ${$role === "field" ? "1 / -1" : $role === "actions" ? "2" : "1"};
    grid-row: ${$role === "actions" ? "1" : "auto"};
    align-items: ${$role === "field" ? "center" : "flex-start"};
    justify-content: ${$role === "field" ? "space-between" : $role === "actions" ? "flex-end" : "flex-start"};
    gap: ${theme.spacing(3)};
    min-width: 0;
    padding: 0;
    text-align: ${$role === "field" ? "right" : "left"};

    &[data-label]::before {
      content: attr(data-label);
      flex-shrink: 0;
      font-size: 13px;
      color: ${theme.brand.steelMuted};
      text-align: left;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      display: table-cell;
      padding: ${theme.spacing(3)} ${theme.spacing(3.5)};
      text-align: ${$align};
      vertical-align: middle;

      &[data-label]::before {
        content: none;
      }
    }
  `}
`;
