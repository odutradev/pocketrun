import styled from "styled-components";

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

export const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Item = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

export const Row = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: 13px;
`;

export const Name = styled.span`
  overflow: hidden;
  color: ${({ theme }) => theme.brand.steel};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Value = styled.span`
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};

  span {
    font-weight: 400;
    color: ${({ theme }) => theme.brand.steelMuted};
  }
`;

export const Track = styled.div`
  height: 6px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.brand.raised};
`;

export const Bar = styled.div`
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.brand.chart.clicks};
`;
