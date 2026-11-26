import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  width: 100%;
  transition: opacity ${({ theme }) => `${theme.motion.base}ms ${theme.motion.easing.standard}`};

  &[aria-busy="true"] {
    opacity: 0.7;
  }
`;

export const Toolbar = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 480px) auto;
    justify-content: space-between;
  }

  > button {
    justify-self: start;
  }
`;

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing(4)};
  }
`;
