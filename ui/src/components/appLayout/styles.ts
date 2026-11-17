import styled from "styled-components";

export const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.brand.graphite};
`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  box-sizing: border-box;
  padding: ${({ theme }) => `${theme.spacing(8)} ${theme.spacing(4)} ${theme.spacing(16)}`};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing(10)} ${theme.spacing(6)} ${theme.spacing(20)}`};
  }
`;
