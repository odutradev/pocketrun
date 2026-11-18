import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
`;

export const Title = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const ChartArea = styled.div`
  position: relative;
`;

export const Center = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

export const CenterValue = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-size: 20px;
  font-variant-numeric: tabular-nums;
`;

export const CenterLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Legend = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const LegendItem = styled.li<{ $isTooltip?: boolean }>`
  ${({ theme, $isTooltip }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing(2)};
    font-size: 13px;
    color: ${theme.brand.steel};

    ${$isTooltip &&
    css`
      min-width: 160px;
      padding: ${theme.spacing(2)} ${theme.spacing(3)};
      border: 1px solid ${theme.brand.strongBorder};
      border-radius: ${theme.radii.box};
      background-color: ${theme.brand.raised};
      box-shadow: ${theme.brand.overlayShadow};
    `}
  `}
`;

export const LegendValue = styled.span`
  margin-left: auto;
  padding-left: ${({ theme }) => theme.spacing(3)};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Swatch = styled.span<{ $color: string }>`
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background-color: ${({ $color }) => $color};
`;
