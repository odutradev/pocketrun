import styled, { css } from "styled-components";

export const Container = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const Title = styled.h2`
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(2.5)}`};
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Item = styled.button<{ $isActive: boolean }>`
  ${({ theme, $isActive }) => css`
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 40px;
    padding: 0 ${theme.spacing(3)};
    border: 0;
    border-radius: ${theme.radii.control};
    background-color: ${$isActive ? theme.accent.soft : "transparent"};
    color: ${theme.brand.steel};
    font-family: ${theme.brand.fonts.mono};
    font-size: 14px;
    font-weight: ${$isActive ? 700 : 400};
    text-align: left;
    overflow-wrap: anywhere;
    cursor: pointer;
    transition: background-color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    &:hover {
      background-color: ${$isActive ? theme.accent.soft : theme.brand.raised};
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: -2px;
    }
  `}
`;

export const Empty = styled.p`
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(2.5)}`};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)};
`;
