import { Link } from "react-router-dom";
import styled from "styled-components";

import type { TopLinkBarStyleProps } from "./types";

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
  grid-template-columns: ${({ theme }) => theme.spacing(6)} minmax(0, 1fr) auto;
  align-items: center;
  gap: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.radii.small};
  color: inherit;
  text-decoration: none;
  transition: background-color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  &:hover {
    background-color: ${({ theme }) => theme.brand.raised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 2px;
  }
`;

export const Rank = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-align: right;
`;

export const Info = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

export const Title = styled.span`
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
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

export const Track = styled.span`
  display: block;
  height: 4px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.brand.raised};
`;

export const Bar = styled.span<TopLinkBarStyleProps>`
  display: block;
  width: ${({ $share }) => `${$share}%`};
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.brand.chart.clicks};
`;

export const Value = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  text-align: right;
`;

export const Empty = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
