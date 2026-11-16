import styled, { css } from "styled-components";

export const Background = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.palette.background.app};
  background-image: ${({ theme }) => theme.palette.primary.glow};
`;

export const Main = styled.main<{ $center: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(12)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(12)};
  }

  ${({ $center }) =>
    $center &&
    css`
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
    `}
`;
