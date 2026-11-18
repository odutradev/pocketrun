import styled, { css, keyframes } from "styled-components";

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

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 700;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.02em;
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
