import styled from "styled-components";

import { Panel } from "../../styles";

import type { TypeFamily } from "@utils/types/brand";



export const Specimen = styled.p<{ $family: TypeFamily }>`
  margin: 0;
  font-family: ${({ theme, $family }) => theme.brand.fonts[$family]};
  font-weight: ${({ $family }) => ($family === "display" ? 800 : $family === "mono" ? 700 : 500)};
  font-size: 96px;
  line-height: 1;
  letter-spacing: ${({ $family }) => ($family === "display" ? "-0.04em" : "-0.02em")};
`;

export const Weights = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Weight = styled.span<{ $family: TypeFamily; $weight: number }>`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(3)};
  border-radius: 999px;
  background-color: ${({ theme }) => theme.brand.raised};
  font-family: ${({ theme, $family }) => theme.brand.fonts[$family]};
  font-weight: ${({ $weight }) => $weight};
  font-size: 14px;
`;

export const Alphabet = styled.p<{ $family: TypeFamily }>`
  margin: 0;
  font-family: ${({ theme, $family }) => theme.brand.fonts[$family]};
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.brand.steelMuted};
  overflow-wrap: anywhere;
`;

export const ScaleRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(6)};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 240px minmax(0, 1fr);
    align-items: baseline;
  }
`;

export const ScaleLabel = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Sample = styled.p<{
  $family: TypeFamily;
  $size: number;
  $lineHeight: number;
  $weight: number;
  $uppercase: boolean;
}>`
  margin: 0;
  min-width: 0;
  font-family: ${({ theme, $family }) => theme.brand.fonts[$family]};
  font-size: ${({ $size }) => Math.min($size, 40)}px;
  line-height: ${({ $lineHeight }) => $lineHeight};
  font-weight: ${({ $weight }) => $weight};
  letter-spacing: ${({ $family, $uppercase }) => ($uppercase ? "0.14em" : $family === "display" ? "-0.03em" : "0")};
  text-transform: ${({ $uppercase }) => ($uppercase ? "uppercase" : "none")};
  overflow-wrap: anywhere;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ $size }) => $size}px;
  }
`;

export const Playground = styled(Panel)`
  gap: ${({ theme }) => theme.spacing(6)};
`;

export const Controls = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: end;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1.4fr) auto 160px;
  }
`;
