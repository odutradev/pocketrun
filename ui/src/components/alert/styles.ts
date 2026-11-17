import styled, { css } from "styled-components";
import type { DefaultTheme } from "styled-components";

import type { AlertTone } from "./types";

const tones = (theme: DefaultTheme): Record<AlertTone, { background: string; border: string; icon: string }> => ({
  neutral: { background: theme.brand.surface, border: theme.brand.border, icon: theme.brand.steelMuted },
  success: { background: theme.brand.states.successSoft, border: theme.brand.states.success, icon: theme.brand.states.successText },
  warning: { background: theme.brand.states.warningSoft, border: theme.brand.states.warning, icon: theme.brand.states.warningText },
  error: { background: theme.brand.states.errorSoft, border: theme.brand.states.errorBorder, icon: theme.brand.states.errorText }
});

export const Root = styled.div<{ $tone: AlertTone; $isBanner: boolean }>`
  ${({ theme, $tone, $isBanner }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: ${theme.spacing(3)};
    padding: ${theme.spacing(3.5)} ${theme.spacing(4)};
    border: 1px solid ${tones(theme)[$tone].border};
    border-radius: ${$isBanner ? 0 : theme.radii.box};
    background-color: ${tones(theme)[$tone].background};
    color: ${theme.brand.steel};

    ${$isBanner &&
    css`
      border-width: 0 0 1px;
      justify-content: center;
    `}
  `}
`;

export const Icon = styled.span<{ $tone: AlertTone }>`
  display: inline-flex;
  flex-shrink: 0;
  padding-top: 2px;
  color: ${({ theme, $tone }) => tones(theme)[$tone].icon};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const Body = styled.div<{ $isBanner: boolean }>`
  flex: ${({ $isBanner }) => ($isBanner ? "0 1 auto" : "1 1 240px")};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
  font-size: 14px;
  line-height: 1.5;
`;

export const Title = styled.strong`
  font-size: 14px;
  font-weight: 700;
`;

export const Message = styled.div`
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Action = styled.div`
  flex-shrink: 0;
`;
