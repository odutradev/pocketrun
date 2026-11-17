import styled from "styled-components";

export const Container = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const PageLabel = styled.span`
  min-width: 96px;
  text-align: center;
`;
