import styled from "styled-components";

export const Fields = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const List = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
