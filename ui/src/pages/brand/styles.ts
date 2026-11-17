import styled, { css } from "styled-components";



export const Page = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.brand.graphite};
  color: ${({ theme }) => theme.brand.steel};
  font-family: ${({ theme }) => theme.brand.fonts.body};
`;

export const Content = styled.main`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(16)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(20)};
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(14)} 0;
  border-top: 1px solid ${({ theme }) => theme.brand.border};
  scroll-margin-top: ${({ theme }) => theme.spacing(32)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(20)} 0;
  }
`;

export const Eyebrow = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Label = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Lead = styled.p`
  margin: 0;
  max-width: 760px;
  font-size: 17px;
  line-height: 1.6;
  color: ${({ theme }) => theme.brand.steelMuted};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 18px;
  }
`;

export const Grid = styled.div<{ $columns: number; $minWidth?: number }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(${({ $columns }) => Math.min($columns, 2)}, minmax(0, 1fr));
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  }
`;

export const Panel = styled.div<{ $padded?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
  background-color: ${({ theme }) => theme.brand.surface};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: 20px;
  box-sizing: border-box;

  ${({ $padded = true }) =>
    $padded &&
    css`
      padding: ${({ theme }) => theme.spacing(6)};
    `}
`;

export const PanelTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 700;
  font-size: 17px;
  line-height: 1.3;
  color: ${({ theme }) => theme.brand.steel};
`;

export const PanelText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Mono = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 0.9em;
`;

export const ControlScroller = styled.div`
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .rt-SegmentedControlRoot {
    width: 100%;
    min-width: max-content;
  }
`;

export const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding-top: ${({ theme }) => theme.spacing(8)};
  border-top: 1px solid ${({ theme }) => theme.brand.border};
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Stage = styled.div<{ $tone: "dark" | "light" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: 16px;
  box-sizing: border-box;
  overflow: hidden;
  background-color: ${({ theme, $tone }) => ($tone === "dark" ? theme.brand.graphite : theme.brand.paper)};
  border: 1px solid ${({ theme, $tone }) => ($tone === "dark" ? theme.brand.border : theme.brand.paperBorder)};
`;
