import styled, { css } from "styled-components";

import type { SegmentedSize } from "./types";

export const Group = styled.div<{ $isFullWidth: boolean; $mobileColumns?: number; $size: SegmentedSize }>`
  ${({ theme, $isFullWidth, $mobileColumns, $size }) => css`
    display: ${$mobileColumns ? "grid" : $isFullWidth ? "flex" : "inline-flex"};
    grid-template-columns: ${$mobileColumns ? `repeat(${$mobileColumns}, minmax(0, 1fr))` : "none"};
    gap: ${$size === "sm" ? "2px" : theme.spacing(1)};
    max-width: 100%;
    padding: ${$size === "sm" ? "2px" : theme.spacing(1)};
    overflow-x: auto;
    border: 1px solid ${theme.brand.border};
    border-radius: ${$size === "sm" ? theme.radii.control : theme.radii.box};
    background-color: ${theme.brand.surface};
    scrollbar-width: none;

    ${$mobileColumns &&
    css`
      > :last-child:nth-child(${$mobileColumns}n + ${$mobileColumns - 1}) {
        grid-column: span 2;
      }
    `}

    @media (min-width: ${theme.breakpoints.md}) {
      display: ${$isFullWidth ? "flex" : "inline-flex"};
    }
  `}
`;

export const Segment = styled.button<{ $isActive: boolean; $isFullWidth: boolean; $isIconOnly: boolean; $size: SegmentedSize }>`
  ${({ theme, $isActive, $isFullWidth, $isIconOnly, $size }) => css`
    display: inline-flex;
    flex: ${$isFullWidth ? "1 0 auto" : "0 0 auto"};
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing(2)};
    height: ${$size === "sm" ? "26px" : $isIconOnly ? "34px" : "40px"};
    min-width: ${$isIconOnly ? ($size === "sm" ? "28px" : "34px") : "auto"};
    padding: 0 ${$isIconOnly ? 0 : theme.spacing(2)};
    border: 0;
    border-radius: ${theme.radii.small};
    background-color: ${$isActive ? theme.brand.raised : "transparent"};
    color: ${$isActive ? theme.brand.steel : theme.brand.steelMuted};
    font-family: ${theme.brand.fonts.body};
    font-size: ${$size === "sm" ? "13px" : "14px"};
    font-weight: ${$isActive ? 700 : 600};
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    @media (min-width: ${theme.breakpoints.md}) {
      padding: 0 ${$isIconOnly ? 0 : $size === "sm" ? theme.spacing(3) : theme.spacing(4)};
    }

    svg {
      flex-shrink: 0;
      width: ${$size === "sm" ? "14px" : "16px"};
      height: ${$size === "sm" ? "14px" : "16px"};
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
