import styled from "styled-components";

import type { CountListStyleProps } from "./types";

export const Container = styled.div<CountListStyleProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  opacity: ${({ $isMuted }) => ($isMuted ? 0.5 : 1)};
  transition: opacity ${({ theme }) => `${theme.motion.base}ms ${theme.motion.easing.standard}`};
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
`;

export const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  font-size: 14px;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const Count = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
