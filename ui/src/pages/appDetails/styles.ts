import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
`;

export const TabLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;
