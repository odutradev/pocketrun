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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
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

export const Progress = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => `${theme.spacing(4)} ${theme.spacing(5)}`};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const ProgressText = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(4)}`};
  font-size: 14px;

  span {
    font-size: 13px;
    color: ${({ theme }) => theme.brand.steelMuted};
  }
`;

export const ProgressBar = styled.div`
  height: 8px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.brand.raised};

  span {
    display: block;
    height: 100%;
    border-radius: ${({ theme }) => theme.radii.pill};
    background-color: ${({ theme }) => theme.brand.chart.clicks};
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

export const PanelTitle = styled.h3`
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
