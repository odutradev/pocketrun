import styled from "styled-components";

export const Container = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(5)};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Title = styled.h2`
  display: inline-flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  font-size: 15px;
  font-weight: 600;
`;

export const Body = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: start;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  }
`;

export const Aside = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;
`;

export const Details = styled.dl`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3.5)}`};
  margin: 0;
  font-size: 13px;

  dt {
    color: ${({ theme }) => theme.brand.steelMuted};
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

export const Mono = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
`;
