import styled, { css } from "styled-components";

export const Group = styled.div<{ $isFullWidth: boolean }>`
  display: ${({ $isFullWidth }) => ($isFullWidth ? "flex" : "inline-flex")};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const Segment = styled.button<{ $isActive: boolean; $isFullWidth: boolean; $isIconOnly: boolean }>`
  ${({ theme, $isActive, $isFullWidth, $isIconOnly }) => css`
    display: inline-flex;
    flex: ${$isFullWidth ? 1 : "initial"};
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing(2)};
    height: ${$isIconOnly ? "34px" : "40px"};
    min-width: ${$isIconOnly ? "34px" : "auto"};
    padding: 0 ${$isIconOnly ? 0 : theme.spacing(4)};
    border: 0;
    border-radius: ${theme.radii.small};
    background-color: ${$isActive ? theme.brand.raised : "transparent"};
    color: ${$isActive ? theme.brand.steel : theme.brand.steelMuted};
    font-family: ${theme.brand.fonts.body};
    font-size: 14px;
    font-weight: ${$isActive ? 700 : 600};
    cursor: pointer;
    transition:
      background-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    svg {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: ${theme.brand.steel};
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 2px;
    }
  `}
`;
