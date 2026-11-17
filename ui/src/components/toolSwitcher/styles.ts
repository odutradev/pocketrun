import styled, { css } from "styled-components";

export const List = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1.5)};
  margin: 0;
  padding: ${({ theme }) => theme.spacing(1)};
  list-style: none;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const Item = styled.li<{ $isActive: boolean }>`
  ${({ theme, $isActive }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing(2)};
    height: 40px;
    padding: 0 ${theme.spacing(3.5)};
    border-radius: ${theme.radii.small};
    background-color: ${$isActive ? theme.accent.base : "transparent"};
    color: ${$isActive ? theme.accent.contrast : theme.brand.steelMuted};
    font-size: 14px;
    font-weight: ${$isActive ? 700 : 600};
    white-space: nowrap;
  `}
`;

export const Soon = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.8;
`;
