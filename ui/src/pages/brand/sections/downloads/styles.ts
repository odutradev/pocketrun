import styled, { css } from "styled-components";

import { Panel } from "../../styles";



export const Generator = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
    align-items: start;
  }
`;

export const Controls = styled(Panel)`
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const Preview = styled(Panel)`
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: sticky;
    top: ${({ theme }) => theme.spacing(36)};
  }
`;

export const PreviewStage = styled.div<{ $isTransparent: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: 16px;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.graphite};

  ${({ $isTransparent }) =>
    $isTransparent &&
    css`
      background-image: conic-gradient(
        ${({ theme }) => theme.brand.raised} 25%,
        ${({ theme }) => theme.brand.graphite} 0 50%,
        ${({ theme }) => theme.brand.raised} 0 75%,
        ${({ theme }) => theme.brand.graphite} 0
      );
      background-size: 24px 24px;
    `}

  svg {
    display: block;
    width: 100%;
    height: auto;
    max-height: 320px;
  }
`;

export const PreviewMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.brand.steelMuted};
  overflow-wrap: anywhere;
`;

export const Hint = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.states.warningText};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: auto;
`;
