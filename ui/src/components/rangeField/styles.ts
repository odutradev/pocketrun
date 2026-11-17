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
`;

export const Track = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
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

export const Scale = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Manual = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 0;
  width: 112px;
`;

export const ManualLabel = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const ManualInput = styled.input<{ $hasError: boolean }>`
  ${({ theme, $hasError }) => css`
    width: 100%;
    height: 44px;
    padding: 0 ${theme.spacing(3)};
    border: 1px solid ${$hasError ? theme.brand.states.error : theme.brand.border};
    border-radius: ${theme.radii.control};
    background-color: ${theme.brand.surface};
    color: ${theme.brand.steel};
    font-family: ${theme.brand.fonts.display};
    font-size: 16px;
    text-align: center;
    box-sizing: border-box;
    appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      margin: 0;
      appearance: none;
    }

    &:hover {
      border-color: ${theme.brand.steelMuted};
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 2px;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      height: 40px;
    }
  `}
`;
