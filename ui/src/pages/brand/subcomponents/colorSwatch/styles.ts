import styled from "styled-components";

import { getReadableTextColor } from "@utils/functions/brandAssets";

import type { SwatchSize } from "./types";



export const SwatchButton = styled.button`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.brand.steel};
    outline-offset: 4px;
    border-radius: 16px;
  }
`;

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: 999px;
  background-color: ${({ theme }) => theme.brand.graphite};
  color: ${({ theme }) => theme.brand.steel};
  font-size: 12px;
  font-weight: 600;
  transition: opacity 0.15s ease;

  @media (hover: hover) {
    opacity: 0;
  }
`;

export const Swatch = styled.span<{ $color: string; $size: SwatchSize }>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ $size }) => ($size === "large" ? 150 : 96)}px;
  padding: ${({ theme }) => theme.spacing(3)};
  box-sizing: border-box;
  border-radius: 16px;
  background-color: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.brand.strongBorder};

  ${SwatchButton}:hover &,
  ${SwatchButton}:focus-visible & {
    ${Chip} {
      opacity: 1;
    }
  }
`;

export const Hex = styled.span<{ $color: string }>`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  font-weight: 700;
  color: ${({ $color }) => getReadableTextColor($color)};
`;

export const Body = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const Name = styled.span`
  font-weight: 700;
  font-size: 16px;
`;

export const Meta = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Description = styled.span`
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
