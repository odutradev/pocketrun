import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
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

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
`;

export const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  }
`;

export const Trio = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(6)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const BotNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
