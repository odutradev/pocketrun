import styled, { css, keyframes } from "styled-components";
import { Link } from "react-router-dom";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Container = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing(3)};
    padding-bottom: ${theme.spacing(4)};
    border-bottom: 1px solid ${theme.brand.border};
  `}
`;

export const Heading = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;

export const Trail = styled.nav`
  flex-shrink: 0;

  ol {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;

export const TrailItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const ParentLink = styled(Link)`
  ${({ theme }) => css`
    border-radius: ${theme.radii.small};
    font-family: ${theme.brand.fonts.display};
    font-weight: 700;
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: -0.02em;
    display: inline-block;
    max-width: 140px;
    overflow: hidden;
    color: ${theme.brand.steelMuted};
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    transition: color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    &:hover {
      color: ${theme.brand.steel};
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 2px;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      max-width: 240px;
      font-size: 24px;
    }
  `}
`;

export const Separator = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: ${({ theme }) => theme.brand.steelMuted};

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const Title = styled.h1<{ $isCurrentCrumb: boolean }>`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 700;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: ${({ theme, $isCurrentCrumb }) => ($isCurrentCrumb ? theme.accent.text : "inherit")};
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 24px;
  }
`;

export const InfoTrigger = styled.button`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: transparent;
    color: ${theme.brand.steelMuted};
    cursor: help;
    transition: color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    svg {
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

export const TooltipText = styled.span`
  display: block;
  max-width: 280px;
  font-size: 13px;
  line-height: 1.5;
`;

export const Actions = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ReloadIconSlot = styled.span<{ $isSpinning: boolean }>`
  ${({ theme, $isSpinning }) => css`
    display: inline-flex;

    ${$isSpinning &&
    css`
      animation: ${spin} ${theme.motion.loop}ms linear infinite;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    `}
  `}
`;
