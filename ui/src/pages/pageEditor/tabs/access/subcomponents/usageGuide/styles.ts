import styled from "styled-components";

export const Container = styled.details`
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};

  &[open] > summary {
    border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const Summary = styled.summary`
  padding: ${({ theme }) => theme.spacing(4)};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 2px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing(4)} ${theme.spacing(5)}`};
  }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(5)};
  }
`;
