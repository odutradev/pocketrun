import styled from "styled-components";

export const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.brand.graphite};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    flex-direction: row;
  }
`;

export const FormSide = styled.main`
  flex: 1 1 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: ${({ theme }) => `${theme.spacing(10)} ${theme.spacing(4)} ${theme.spacing(14)}`};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing(14)} ${theme.spacing(6)}`};
  }
`;
