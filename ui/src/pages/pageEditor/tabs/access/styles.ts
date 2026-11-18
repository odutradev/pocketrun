import styled from "styled-components";

export const Container = styled.div`
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

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const PanelHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const PanelTitle = styled.h2`
  display: inline-flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  font-size: 15px;
  font-weight: 600;
`;

export const Count = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const KeyList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const KeyItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => `${theme.spacing(3)} 0`};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const KeyMain = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const KeyName = styled.span`
  overflow: hidden;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const KeyMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const KeyPin = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.brand.steel};
`;

export const KeyActions = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(1)};
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
