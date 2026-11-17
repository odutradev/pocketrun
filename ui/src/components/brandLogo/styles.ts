import styled from "styled-components";

import type { BrandLogoLayout } from "./types";

export const Wrapper = styled.span<{ $layout: BrandLogoLayout; $size: number }>`
  display: inline-flex;
  flex-direction: ${({ $layout }) => ($layout === "stacked" ? "column" : "row")};
  align-items: center;
  gap: ${({ $layout, $size }) => ($layout === "stacked" ? $size * 0.42 : $size * 0.36)}px;
`;

export const Wordmark = styled.span<{ $size: number; $color: string }>`
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: ${({ $size }) => $size}px;
  line-height: 1;
  letter-spacing: -0.035em;
  white-space: nowrap;
  color: ${({ $color }) => $color};
`;

export const Letter = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
`;
