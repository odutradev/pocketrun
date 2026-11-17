import styled, { css } from "styled-components";

import type { SetupStepState } from "./types";

export const List = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Step = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

export const Marker = styled.span<{ $state: SetupStepState }>`
  ${({ theme, $state }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    box-sizing: border-box;
    border: 1px solid ${$state === "next" ? theme.brand.strongBorder : "transparent"};
    border-radius: 50%;
    background-color: ${$state === "done" ? theme.brand.states.success : $state === "current" ? theme.brand.steel : "transparent"};
    color: ${$state === "done" ? theme.brand.white : $state === "current" ? theme.brand.graphite : theme.brand.steelMuted};
    font-size: 13px;
    font-weight: 700;
  `}
`;

export const Label = styled.span<{ $state: SetupStepState }>`
  font-size: 14px;
  font-weight: ${({ $state }) => ($state === "current" ? 700 : 500)};
  color: ${({ theme, $state }) => ($state === "next" ? theme.brand.steelMuted : theme.brand.steel)};
`;

export const Connector = styled.span<{ $isDone: boolean }>`
  display: none;
  width: 40px;
  height: 2px;
  background-color: ${({ theme, $isDone }) => ($isDone ? theme.brand.states.success : theme.brand.border)};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: block;
  }
`;
