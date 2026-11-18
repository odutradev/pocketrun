import styled from "styled-components";

import type { VersionItemStyleProps } from "./types";

export const Container = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(5)};
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(240px, 1fr) minmax(0, 3fr);
    align-items: start;
  }
`;

export const ListPanel = styled.section`
  max-height: 70vh;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: ${({ theme }) => theme.spacing(2)};
  list-style: none;
`;

export const Item = styled.button<VersionItemStyleProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme, $isSelected }) => ($isSelected ? theme.accent.base : "transparent")};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme, $isSelected }) => ($isSelected ? theme.brand.raised : "transparent")};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.brand.raised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 2px;
  }
`;

export const ItemTitle = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
`;

export const ItemMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Comparison = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;

  & > div {
    align-self: stretch;
  }
`;

export const ComparisonHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const ComparisonTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  font-weight: 600;
`;

export const Note = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
