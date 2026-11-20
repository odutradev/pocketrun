import { Link } from "react-router-dom";
import styled from "styled-components";

import type { AttentionTone } from "@utils/types/overview";

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Item = styled(Link)`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.radii.small};
  color: inherit;
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) => theme.brand.raised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: -2px;
  }
`;

export const Dot = styled.span<{ $tone: AttentionTone }>`
  width: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme, $tone }) => {
    if ($tone === "error") return theme.brand.states.error;
    if ($tone === "warning") return theme.brand.states.warning;
    return theme.brand.steelMuted;
  }};
`;

export const Text = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

export const Title = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

export const Description = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Clear = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
