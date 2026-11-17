import styled, { css } from "styled-components";

const levelColor = (level: number) => css`
  background-color: ${({ theme }) => (level === 0 ? theme.brand.raised : theme.brand.chart.clicks)};
  opacity: ${level === 0 ? 1 : level};
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
  overflow-x: auto;
`;

export const Peak = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};

  strong {
    color: ${({ theme }) => theme.brand.steel};
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 32px repeat(24, minmax(12px, 1fr));
  gap: 3px;
  min-width: 420px;
`;

export const HourLabel = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 10px;
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;

export const RowLabel = styled.span`
  align-self: center;
  font-size: 11px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Cell = styled.span<{ $level: number }>`
  aspect-ratio: 1;
  min-height: 12px;
  border-radius: 3px;
  ${({ $level }) => levelColor($level)}
`;

export const Scale = styled.div`
  display: inline-flex;
  align-items: center;
  align-self: flex-end;
  gap: 3px;
  font-size: 11px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const ScaleStep = styled.span<{ $level: number }>`
  width: 12px;
  height: 12px;
  margin: 0 1px;
  border-radius: 3px;
  ${({ $level }) => levelColor($level)}
`;
