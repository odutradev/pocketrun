import styled from "styled-components";
import type { DefaultTheme } from "styled-components";

import type { CodeTokenKind } from "./types";

const tokenColors = (theme: DefaultTheme): Record<CodeTokenKind, string> => ({
  key: theme.accent.text,
  string: theme.brand.steel,
  literal: theme.brand.steelMuted,
  plain: theme.brand.steelMuted
});

export const Container = styled.div`
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.graphite};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => `${theme.spacing(1.5)} ${theme.spacing(1.5)} ${theme.spacing(1.5)} ${theme.spacing(4)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.raised};
`;

export const Title = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Pre = styled.pre<{ $maxHeight?: string }>`
  margin: 0;
  padding: ${({ theme }) => theme.spacing(4)};
  max-height: ${({ $maxHeight }) => $maxHeight ?? "none"};
  overflow: auto;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  line-height: 1.7;
  color: ${({ theme }) => theme.brand.steel};
  white-space: pre;
`;

export const Token = styled.span<{ $kind: CodeTokenKind }>`
  color: ${({ theme, $kind }) => tokenColors(theme)[$kind]};
`;
