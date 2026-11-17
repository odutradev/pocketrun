import styled from "styled-components";

export const Container = styled.section`
  flex: 1 1 520px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(12)};
  box-sizing: border-box;
  padding: ${({ theme }) => `${theme.spacing(6)} ${theme.spacing(4)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing(8)} ${theme.spacing(6)}`};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => `${theme.spacing(14)} clamp(${theme.spacing(10)}, 6vw, ${theme.spacing(22)})`};
    border-bottom: 0;
    border-right: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const Pitch = styled.div`
  display: none;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(7)};
  max-width: 560px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;

export const Headline = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: clamp(32px, 3.6vw, 48px);
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Description = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.6;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Tools = styled.ul`
  display: none;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;
