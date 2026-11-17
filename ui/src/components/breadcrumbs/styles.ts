import { Link } from "react-router-dom";
import styled from "styled-components";

export const List = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Item = styled.li`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

export const Crumb = styled(Link)`
  color: ${({ theme }) => theme.brand.steelMuted};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.brand.steel};
    text-decoration: underline;
  }
`;

export const Current = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.brand.steel};
`;
