import styled, { css, keyframes } from "styled-components";

import type { ApiStatusVariant } from "./types";

// O halo cresce e some; o ponto em si fica parado para o estado continuar legível.
const halo = keyframes`
  0% { transform: scale(1); opacity: 0.9; }
  70%, 100% { transform: scale(2.6); opacity: 0; }
`;

export const Container = styled.div<{ $variant: Exclude<ApiStatusVariant, "dot"> }>`
  ${({ theme, $variant }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing(2.5)};
    border: 1px solid ${theme.brand.border};
    font-size: 14px;
    color: ${theme.brand.steelMuted};

    ${$variant === "pill"
      ? css`
          padding: ${theme.spacing(2)} ${theme.spacing(3)};
          border-radius: ${theme.radii.pill};
        `
      : css`
          padding: ${theme.spacing(3.5)} ${theme.spacing(4)};
          border-radius: ${theme.radii.box};
          background-color: ${theme.brand.surface};
        `}
  `}
`;

export const DotTrigger = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: default;
`;

export const Dot = styled.span<{ $isOnline: boolean; $isPulsing?: boolean }>`
  ${({ theme, $isOnline, $isPulsing }) => css`
    position: relative;
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${$isOnline ? theme.brand.states.success : theme.brand.states.error};
    box-shadow: 0 0 0 3px ${$isOnline ? theme.brand.states.successSoft : theme.brand.states.errorSoft};

    ${$isPulsing &&
    css`
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background-color: inherit;
        animation: ${halo} ${theme.motion.pulse}ms ${theme.motion.easing.standard} infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        &::after {
          animation: none;
          opacity: 0;
        }
      }
    `}
  `}
`;

export const Address = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  overflow-wrap: anywhere;
`;

export const TooltipBody = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

export const TooltipLine = styled.span`
  font-size: 13px;
`;
