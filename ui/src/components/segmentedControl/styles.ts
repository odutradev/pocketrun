import styled, { css } from "styled-components";

export const Group = styled.div<{ $isFullWidth: boolean; $mobileColumns?: number }>`
  ${({ theme, $isFullWidth, $mobileColumns }) => css`
    display: ${$mobileColumns ? "grid" : $isFullWidth ? "flex" : "inline-flex"};
    grid-template-columns: ${$mobileColumns ? `repeat(${$mobileColumns}, minmax(0, 1fr))` : "none"};
    gap: ${theme.spacing(1)};
    max-width: 100%;
    padding: ${theme.spacing(1)};
    overflow-x: auto;
    border: 1px solid ${theme.brand.border};
    border-radius: ${theme.radii.box};
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

export const Segment = styled.button<{ $isActive: boolean; $isFullWidth: boolean; $isIconOnly: boolean }>`
  ${({ theme, $isActive, $isFullWidth, $isIconOnly }) => css`
    display: inline-flex;
    flex: ${$isFullWidth ? "1 0 auto" : "0 0 auto"};
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing(2)};
    height: ${$isIconOnly ? "34px" : "40px"};
    min-width: ${$isIconOnly ? "34px" : "auto"};
    padding: 0 ${$isIconOnly ? 0 : theme.spacing(2)};
    border: 0;
    border-radius: ${theme.radii.small};
    background-color: ${$isActive ? theme.brand.raised : "transparent"};
    color: ${$isActive ? theme.brand.steel : theme.brand.steelMuted};
    font-family: ${theme.brand.fonts.body};
    font-size: 14px;
    font-weight: ${$isActive ? 700 : 600};
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    @media (min-width: ${theme.breakpoints.md}) {
      padding: 0 ${$isIconOnly ? 0 : theme.spacing(4)};
    }

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
