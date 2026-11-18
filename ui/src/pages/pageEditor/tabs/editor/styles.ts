import styled from "styled-components";

import type { MeterStyleProps } from "./types";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Status = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ToolbarActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Meter = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const MeterText = styled.p<MeterStyleProps>`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  font-size: 13px;
  color: ${({ theme, $isOver }) => ($isOver ? theme.brand.states.errorText : theme.brand.steelMuted)};

  strong {
    font-weight: 600;
    color: ${({ theme, $isOver }) => ($isOver ? theme.brand.states.errorText : theme.brand.steel)};
  }
`;

export const MeterBar = styled.div<MeterStyleProps>`
  height: 6px;
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

export const Workspace = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

export const PreviewPanel = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const PreviewTitle = styled.h2`
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Frame = styled.iframe`
  flex: 1;
  width: 100%;
  height: 60vh;
  min-height: 320px;
  border: 0;
  background-color: ${({ theme }) => theme.brand.white};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: auto;
  }
`;
