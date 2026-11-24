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

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(6)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.card};
  background-color: ${({ theme }) => theme.brand.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(8)};
  }
`;

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: 26px;
  line-height: 1.1;
  letter-spacing: -0.03em;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 28px;
  }
`;

export const Description = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;
