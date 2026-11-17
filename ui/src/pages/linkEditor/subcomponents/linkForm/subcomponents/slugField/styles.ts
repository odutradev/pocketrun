import styled, { css, keyframes } from "styled-components";

import type { SlugStatus } from "./types";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const DiceSlot = styled.div`
  padding-top: 27px;
`;

export const StatusIcon = styled.span<{ $status: SlugStatus }>`
  ${({ theme, $status }) => css`
    display: inline-flex;
    padding: 0 ${theme.spacing(2)};
    color: ${$status === "available"
      ? theme.brand.states.success
      : $status === "unavailable"
        ? theme.brand.states.errorText
        : theme.brand.steelMuted};

    svg {
      width: 18px;
      height: 18px;
    }

    ${$status === "checking" &&
    css`
      svg {
        animation: ${spin} ${theme.motion.loop}ms linear infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        svg {
          animation: none;
        }
      }
    `}
  `}
`;

export const PublicUrl = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  overflow-wrap: anywhere;
`;

export const PublicUrlLine = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  max-width: 100%;
`;

export const CopyButton = styled.button`
  ${({ theme }) => css`
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: ${theme.radii.small};
    background: transparent;
    color: ${theme.brand.steelMuted};
    cursor: pointer;
    transition: color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background-color: ${theme.brand.raised};
      color: ${theme.brand.steel};
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 1px;
    }
  `}
`;
