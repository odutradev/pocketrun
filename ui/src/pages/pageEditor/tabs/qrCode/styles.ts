import styled, { css } from "styled-components";

import type { QrPreviewStyleProps } from "./types";

export const Container = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    align-items: start;
  }
`;

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
`;

export const Preview = styled.div<QrPreviewStyleProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.white};

  ${({ theme, $isTransparent }) =>
    $isTransparent &&
    css`
      background-color: ${theme.brand.paperRaised};
      background-image:
        linear-gradient(45deg, ${theme.brand.paperBorder} 25%, transparent 25%),
        linear-gradient(-45deg, ${theme.brand.paperBorder} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${theme.brand.paperBorder} 75%),
        linear-gradient(-45deg, transparent 75%, ${theme.brand.paperBorder} 75%);
      background-position: 0 0, 0 8px, 8px -8px, -8px 0;
      background-size: 16px 16px;
    `}

  img {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

export const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const FieldLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Downloads = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;
