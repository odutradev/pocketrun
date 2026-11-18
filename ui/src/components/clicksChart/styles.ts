import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
`;

export const Legend = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(4)}`};
  margin: 0;
  padding: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
  list-style: none;
`;

export const LegendItem = styled.li`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Swatch = styled.span<{ $color: string; $isDashed?: boolean }>`
  ${({ $color, $isDashed }) => css`
    display: inline-block;
    flex-shrink: 0;
    width: 14px;
    height: 0;
    border-top: 2px ${$isDashed ? "dashed" : "solid"} ${$color};
  `}
`;

export const TooltipBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 180px;
  padding: ${({ theme }) => `${theme.spacing(2.5)} ${theme.spacing(3)}`};
  border: 1px solid ${({ theme }) => theme.brand.strongBorder};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.raised};
  box-shadow: ${({ theme }) => theme.brand.overlayShadow};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const TooltipTitle = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};

  &::first-letter {
    text-transform: uppercase;
  }
`;

export const TooltipRow = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  strong {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.brand.steel};
  }
`;
