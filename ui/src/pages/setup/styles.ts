import styled from "styled-components";

export const Container = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(8)};
  box-sizing: border-box;
  padding: ${({ theme }) => `${theme.spacing(10)} ${theme.spacing(4)} ${theme.spacing(14)}`};
  background-color: ${({ theme }) => theme.brand.graphite};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.spacing(9)};
    padding: ${({ theme }) => `${theme.spacing(12)} ${theme.spacing(6)}`};
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  width: 100%;
  max-width: ${({ theme }) => theme.layout.setupWidth};
`;
