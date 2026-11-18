import type { theme } from "./theme";

export interface AccentColors {
  base: string;
  text: string;
  soft: string;
  contrast: string;
}

export interface GroupColorTokens {
  base: string;
  text: string;
  soft: string;
}

export type AppTheme = typeof theme;
