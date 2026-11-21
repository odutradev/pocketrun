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
  scroll-margin-top: ${({ theme }) => theme.spacing(6)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(6)};
  }
`;

export const Heading = styled.h2`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
  font-size: 18px;
  font-weight: 700;
`;

export const Number = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.accent.text};
`;
