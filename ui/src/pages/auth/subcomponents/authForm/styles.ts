import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  max-width: ${({ theme }) => theme.layout.formWidth};
`;

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

export const Eyebrow = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: -0.03em;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 30px;
  }
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
