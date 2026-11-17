import styled from "styled-components";

export const Table = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: 16px;
  overflow: hidden;
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: center;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const TableHead = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const TableCell = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  font-size: 14px;
  overflow-wrap: anywhere;
`;

export const TokenColor = styled.span<{ $color: string }>`
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 5px;
  background-color: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.brand.strongBorder};
`;

export const Code = styled.pre`
  margin: 0;
  padding: ${({ theme }) => theme.spacing(5)};
  border-radius: 14px;
  background-color: ${({ theme }) => theme.brand.graphite};
  border: 1px solid ${({ theme }) => theme.brand.border};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  line-height: 1.7;
  color: ${({ theme }) => theme.brand.steel};
  overflow-x: auto;
`;
