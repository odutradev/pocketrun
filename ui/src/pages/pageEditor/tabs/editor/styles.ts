import styled, { css } from "styled-components";

import type { MeterStyleProps, PaneStyleProps, PanesStyleProps, WorkbenchStyleProps } from "./types";

export const Workbench = styled.section<WorkbenchStyleProps>`
  display: flex;
  flex-direction: column;
  height: max(520px, calc(100vh - 260px));
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.graphite};

  ${({ theme, $isExpanded }) =>
    $isExpanded &&
    css`
      position: fixed;
      inset: 0;
      z-index: 70;
      height: auto;
      border: 0;
      border-radius: 0;
      background-color: ${theme.brand.graphite};
    `}
`;

export const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};
  min-height: 48px;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(3)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const BarGroup = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
`;

export const Actions = styled.div`
  display: flex;
  flex: 1 1 320px;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

export const Divider = styled.span`
  flex-shrink: 0;
  width: 1px;
  height: 20px;
  margin: 0 ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.brand.border};
`;

export const Status = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

export const MessageField = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  max-width: 260px;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

export const Panes = styled.div<PanesStyleProps>`
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1fr);
  min-height: 0;

  ${({ $isSplit }) =>
    $isSplit &&
    css`
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    `}
`;

export const Pane = styled.div<PaneStyleProps>`
  display: flex;
  min-width: 0;
  min-height: 0;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.brand.border};
  }

  ${({ theme, $isPreview }) =>
    $isPreview &&
    css`
      background-color: ${theme.brand.white};
    `}
`;

export const Frame = styled.iframe`
  flex: 1;
  width: 100%;
  height: 100%;
  border: 0;
  background-color: ${({ theme }) => theme.brand.white};
`;

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(4)}`};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  border-top: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const Meter = styled.div`
  display: flex;
  flex: 1 1 260px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
`;

export const MeterText = styled.p<MeterStyleProps>`
  flex-shrink: 0;
  margin: 0;
  font-size: 12px;
  color: ${({ theme, $isOver }) => ($isOver ? theme.brand.states.errorText : theme.brand.steelMuted)};

  strong {
    font-weight: 600;
    color: ${({ theme, $isOver }) => ($isOver ? theme.brand.states.errorText : theme.brand.steel)};
  }
`;

export const MeterBar = styled.div<MeterStyleProps>`
  flex: 1;
  max-width: 240px;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.brand.raised};

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background-color: ${({ theme, $isOver }) => ($isOver ? theme.brand.states.error : theme.accent.base)};
    transition: width ${({ theme }) => theme.motion.base}ms ${({ theme }) => theme.motion.easing.standard};
  }
`;

export const FooterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Hint = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
