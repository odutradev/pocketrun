import styled from "styled-components";

export const Container = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Number = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: ${({ theme }) => theme.brand.steel};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 44px;
  }
`;
