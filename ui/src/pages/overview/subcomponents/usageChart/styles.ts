import styled from "styled-components";

export const Summary = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const SummaryItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

export const SummaryLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const SummaryValue = styled.span<{ $color: string }>`
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-size: 22px;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

export const SummaryChange = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Swatch = styled.span<{ $color: string }>`
  display: inline-block;
  flex-shrink: 0;
  width: 14px;
  height: 0;
  border-top: 2px solid ${({ $color }) => $color};
`;

export const TooltipBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 190px;
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
    color: ${({ theme }) => theme.brand.steel};
  }
`;

export const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
