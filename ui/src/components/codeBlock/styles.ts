import styled from "styled-components";

import type { CodeTokenKind } from "@utils/types/code";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.code.background};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  min-height: ${({ theme }) => theme.spacing(11)};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(1.5)} ${theme.spacing(1)} ${theme.spacing(4)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const Title = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Pre = styled.pre<{ $maxHeight?: string }>`
  flex: 1;
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing(3.5)} ${theme.spacing(4)}`};
  max-height: ${({ $maxHeight }) => $maxHeight ?? "none"};
  overflow-x: hidden;
  overflow-y: auto;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12.5px;
  line-height: 1.7;
  color: ${({ theme }) => theme.brand.code.plain};
  tab-size: 2;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.brand.code.scrollbar} transparent`};

  &::-webkit-scrollbar {
    width: ${({ theme }) => theme.spacing(2)};
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border: 2px solid ${({ theme }) => theme.brand.code.background};
    border-radius: ${({ theme }) => theme.radii.pill};
    background-color: ${({ theme }) => theme.brand.code.scrollbar};
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.brand.code.scrollbarHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: -2px;
  }
`;

export const Line = styled.span.attrs<{ $indent: number }>(({ $indent }) => ({
  style: { paddingLeft: `${$indent + 2}ch`, textIndent: `-${$indent + 2}ch` }
}))<{ $indent: number }>`
  display: block;
  min-height: 1.7em;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

export const Token = styled.span<{ $kind: CodeTokenKind }>`
  color: ${({ theme, $kind }) => theme.brand.code[$kind]};
  font-style: ${({ $kind }) => ($kind === "comment" ? "italic" : "normal")};
`;
