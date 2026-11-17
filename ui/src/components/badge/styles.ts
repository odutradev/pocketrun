import styled, { css } from "styled-components";

import type { DefaultTheme } from "styled-components";
import type { BadgeTone } from "./types";

const tones = (theme: DefaultTheme): Record<BadgeTone, { background: string; color: string; dot: string }> => ({
  neutral: { background: theme.brand.raised, color: theme.brand.steelMuted, dot: theme.brand.steelMuted },
  accent: { background: theme.accent.soft, color: theme.accent.text, dot: theme.accent.base },
  success: { background: theme.brand.states.successSoft, color: theme.brand.states.successText, dot: theme.brand.states.success },
  warning: { background: theme.brand.states.warningSoft, color: theme.brand.states.warningText, dot: theme.brand.states.warning },
  error: { background: theme.brand.states.errorSoft, color: theme.brand.states.errorText, dot: theme.brand.states.error }
});

export const Root = styled.span<{ $tone: BadgeTone; $isMono: boolean }>`
  ${({ theme, $tone, $isMono }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing(1.5)};
    max-width: 100%;
    padding: ${theme.spacing(1)} ${theme.spacing(2.5)};
    border-radius: ${theme.radii.pill};
    background-color: ${tones(theme)[$tone].background};
    color: ${tones(theme)[$tone].color};
    font-family: ${$isMono ? theme.brand.fonts.mono : theme.brand.fonts.body};
    font-size: ${$isMono ? "12px" : "13px"};
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    svg {
      flex-shrink: 0;
      width: 13px;
      height: 13px;
    }
  `}
`;

export const Dot = styled.span<{ $tone: BadgeTone }>`
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ theme, $tone }) => tones(theme)[$tone].dot};
`;
