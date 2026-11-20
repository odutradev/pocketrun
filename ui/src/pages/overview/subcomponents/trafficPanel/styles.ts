import { Link } from "react-router-dom";
import styled from "styled-components";

export const Totals = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
`;

export const Total = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

export const TotalValue = styled.dd`
  order: -1;
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.accent.text};
`;

export const TotalLabel = styled.dt`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Change = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const List = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Item = styled(Link)`
  display: grid;
  grid-template-columns: ${({ theme }) => theme.spacing(5)} minmax(0, 1fr) auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.small};
  color: inherit;
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) => theme.brand.raised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: -2px;
  }
`;

export const Rank = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Info = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const ItemTitle = styled.span`
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Slug = styled.span`
  overflow: hidden;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Value = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
`;

export const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
