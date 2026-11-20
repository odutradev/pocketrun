import styled, { css } from "styled-components";

import type { OperationChipStyleProps } from "./types";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const RulesLegend = styled.h3`
  margin: ${({ theme }) => `${theme.spacing(2)} 0 0`};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
`;

export const RuleList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const RuleCard = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.raised};
`;

export const RuleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const RuleTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const RuleFields = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    align-items: start;
  }
`;

export const Operations = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const OperationChip = styled.button<OperationChipStyleProps>`
  min-height: 32px;
  padding: ${({ theme }) => `0 ${theme.spacing(3)}`};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: transparent;
  color: ${({ theme }) => theme.brand.steelMuted};
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  ${({ theme, $isActive }) =>
    $isActive &&
    css`
      border-color: ${theme.accent.base};
      background-color: ${theme.accent.soft};
      color: ${theme.accent.text};
    `}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;
