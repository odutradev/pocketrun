import styled from "styled-components";

import type { BrandTool } from "@utils/types/brand";



export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

export const GuidesToggle = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  min-height: 44px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

export const Figure = styled.div`
  position: relative;
  width: min(100%, 420px);
  aspect-ratio: 1;
  margin: 0 auto;

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
`;

export const Guides = styled.svg`
  pointer-events: none;

  .grid {
    stroke: ${({ theme }) => theme.brand.border};
    stroke-width: 0.25;
  }

  .axis {
    stroke: ${({ theme }) => theme.brand.steelMuted};
    stroke-width: 0.35;
    stroke-dasharray: 1.5 1.5;
  }

  .pivot {
    fill: none;
    stroke: ${({ theme }) => theme.brand.steel};
    stroke-width: 0.5;
  }
`;

export const Parts = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const PartHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Dot = styled.span<{ $tool?: BrandTool }>`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: ${({ theme, $tool }) => ($tool ? theme.brand.tools[$tool].base : theme.brand.steel)};
`;

export const PartSpec = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Rule = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(5)};
  border-radius: 16px;
  background-color: ${({ theme }) => theme.brand.surface};
  border: 1px solid ${({ theme }) => theme.brand.border};
  font-size: 16px;
  line-height: 1.55;
  color: ${({ theme }) => theme.brand.steelMuted};

  strong {
    color: ${({ theme }) => theme.brand.steel};
  }
`;
