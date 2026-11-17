import styled from "styled-components";

export const Container = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(5)};
`;

export const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
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
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 42px;
  }
`;

export const Description = styled.p`
  max-width: 640px;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 17px;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;
