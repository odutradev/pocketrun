import styled, { css } from "styled-components";

import type { VersionItemStyleProps, WorkbenchStyleProps } from "./types";

export const Container = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 260px minmax(0, 1fr);
    align-items: start;
  }
`;

export const ListPanel = styled.section`
  display: flex;
  flex-direction: column;
  max-height: 40vh;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-height: max(520px, calc(100vh - 260px));
  }
`;

export const ListTitle = styled.h2`
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;

  li + li {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const Item = styled.button<VersionItemStyleProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
  border: 0;
  background-color: ${({ theme, $isSelected }) => ($isSelected ? theme.brand.raised : "transparent")};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background-color: ${({ theme, $isSelected }) => ($isSelected ? theme.accent.base : "transparent")};
  }

  &:hover {
    background-color: ${({ theme }) => theme.brand.raised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: -2px;
  }
`;

export const ItemHeader = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ItemLabel = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
`;

export const ItemMessage = styled.span`
  font-size: 13px;
  line-height: 1.4;
  color: ${({ theme }) => theme.brand.steel};
  overflow-wrap: anywhere;
`;

export const ItemMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Workbench = styled.section<WorkbenchStyleProps>`
  display: flex;
  flex-direction: column;
  height: max(520px, calc(100vh - 260px));
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.graphite};

  ${({ $isExpanded }) =>
    $isExpanded &&
    css`
      position: fixed;
      inset: 0;
      z-index: 70;
      height: auto;
      border: 0;
      border-radius: 0;
    `}
`;

export const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 48px;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(4)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const BarGroup = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
`;

export const Tools = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: auto;
`;

export const BaseField = styled.div`
  width: 200px;
  margin-right: ${({ theme }) => theme.spacing(1)};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 150px;
  }
`;

export const Title = styled.h2`
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Stats = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(2)};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  font-weight: 700;
`;

export const Added = styled.span`
  color: ${({ theme }) => theme.brand.states.successText};
`;

export const Removed = styled.span`
  color: ${({ theme }) => theme.brand.states.errorText};
`;

export const Body = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;
