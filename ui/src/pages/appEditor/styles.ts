import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  min-width: 0;
`;

export const TabArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  min-width: 0;
`;

export const Panel = styled.section`
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

export const PanelHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

export const PanelTitle = styled.h2`
  display: inline-flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
`;

export const PanelCount = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Rules = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing(4)};
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const SplitLayout = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    align-items: start;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  min-width: 0;
`;

export const Mono = styled.code`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steel};
`;
