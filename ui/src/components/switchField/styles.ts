import styled, { css } from "styled-components";

export const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

export const Label = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Description = styled.span`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

// Ligado usa o verde de sucesso: é estado, não ferramenta.
export const Track = styled.button<{ $isChecked: boolean }>`
  ${({ theme, $isChecked }) => css`
    position: relative;
    flex-shrink: 0;
    width: 48px;
    height: 28px;
    padding: 0;
    border: 1px solid ${$isChecked ? theme.brand.states.success : theme.brand.strongBorder};
    border-radius: ${theme.radii.pill};
    background-color: ${$isChecked ? theme.brand.states.success : theme.brand.raised};
    cursor: pointer;
    transition:
      background-color ${theme.motion.base}ms ${theme.motion.easing.standard},
      border-color ${theme.motion.base}ms ${theme.motion.easing.standard};

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `}
`;

export const Thumb = styled.span<{ $isChecked: boolean }>`
  ${({ theme, $isChecked }) => css`
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${$isChecked ? theme.brand.white : theme.brand.steelMuted};
    transform: translateX(${$isChecked ? "20px" : "0"});
    transition:
      transform ${theme.motion.base}ms ${theme.motion.easing.snap},
      background-color ${theme.motion.base}ms ${theme.motion.easing.standard};
  `}
`;
