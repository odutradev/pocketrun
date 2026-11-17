import styled, { css } from "styled-components";

export const List = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  overflow-x: auto;
  scrollbar-width: none;
`;

export const Tab = styled.button<{ $isActive: boolean; $isDanger: boolean }>`
  ${({ theme, $isActive, $isDanger }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing(2)};
    flex-shrink: 0;
    height: 48px;
    padding: 0 ${theme.spacing(4)};
    border: 0;
    background: transparent;
    box-shadow: ${$isActive ? `inset 0 -2px 0 ${$isDanger ? theme.brand.states.error : theme.accent.base}` : "none"};
    color: ${$isDanger ? theme.brand.states.errorText : $isActive ? theme.brand.steel : theme.brand.steelMuted};
    font-family: ${theme.brand.fonts.body};
    font-size: 15px;
    font-weight: ${$isActive ? 700 : 500};
    white-space: nowrap;
    cursor: pointer;
    transition:
      color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      box-shadow ${theme.motion.base}ms ${theme.motion.easing.standard};

    &:hover {
      color: ${$isDanger ? theme.brand.states.errorText : theme.brand.steel};
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: -2px;
    }
  `}
`;

export const Count = styled.span`
  min-width: 20px;
  padding: 1px ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.brand.raised};
  color: ${({ theme }) => theme.brand.steelMuted};
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;
