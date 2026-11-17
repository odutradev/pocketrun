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
