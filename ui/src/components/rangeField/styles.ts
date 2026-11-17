import styled, { css } from "styled-components";

const thumb = css`
  width: 20px;
  height: 20px;
  border: 3px solid ${({ theme }) => theme.brand.graphite};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.accent.base};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.accent.base};
  cursor: grab;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 44px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 40px;
  }
`;

export const Track = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 100%;
  min-width: 0;
`;

export const Bound = styled.span`
  flex-shrink: 0;
  min-width: 2ch;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-align: center;
`;

export const Slider = styled.input<{ $fill: number }>`
  ${({ theme, $fill }) => css`
    width: 100%;
    height: 24px;
    margin: 0;
    background: transparent;
    cursor: pointer;
    appearance: none;

    &::-webkit-slider-runnable-track {
      height: 6px;
      border-radius: ${theme.radii.pill};
      background: linear-gradient(
        to right,
        ${theme.accent.base} ${$fill}%,
        ${theme.brand.raised} ${$fill}%
      );
    }

    &::-webkit-slider-thumb {
      ${thumb}
      margin-top: -7px;
      appearance: none;
    }

    &::-moz-range-track {
      height: 6px;
      border-radius: ${theme.radii.pill};
      background-color: ${theme.brand.raised};
    }

    &::-moz-range-progress {
      height: 6px;
      border-radius: ${theme.radii.pill};
      background-color: ${theme.accent.base};
    }

    &::-moz-range-thumb {
      ${thumb}
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 4px;
      border-radius: ${theme.radii.small};
    }
  `}
`;

export const Manual = styled.label<{ $hasError: boolean }>`
  ${({ theme, $hasError }) => css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    width: 132px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid ${$hasError ? theme.brand.states.error : theme.brand.strongBorder};
    border-radius: ${theme.radii.control};
    background-color: ${theme.brand.graphite};
    cursor: text;
    transition: border-color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    &:hover {
      border-color: ${$hasError ? theme.brand.states.error : theme.brand.steelMuted};
    }

    &:focus-within {
      border-color: ${$hasError ? theme.brand.states.error : theme.accent.base};
      box-shadow: 0 0 0 3px ${$hasError ? theme.brand.states.errorSoft : theme.accent.soft};
    }
  `}
`;

export const ManualInput = styled.input`
  ${({ theme }) => css`
    flex: 1;
    width: 100%;
    min-width: 0;
    height: 100%;
    padding: 0 ${theme.spacing(3)};
    border: 0;
    background: transparent;
    color: ${theme.brand.steel};
    font-family: ${theme.brand.fonts.display};
    font-size: 16px;
    text-align: center;
    outline: none;
    appearance: textfield;

    &::placeholder {
      color: ${theme.brand.steelMuted};
      font-family: ${theme.brand.fonts.body};
      font-size: 14px;
      opacity: 0.7;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      margin: 0;
      appearance: none;
    }
  `}
`;
