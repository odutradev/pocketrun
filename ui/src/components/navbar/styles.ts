import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

// Dentro de uma ferramenta, o topo ganha o traço de 3 px na cor dela (ponto de contexto 1).
export const Header = styled.header`
  ${({ theme }) => css`
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid ${theme.brand.border};
    background-color: ${theme.brand.graphite};
    box-shadow: ${theme.context === "general" ? "none" : `inset 0 3px 0 ${theme.accent.base}`};
  `}
`;

// No celular: logo e conta na primeira linha, navegação embaixo. A partir do tablet, tudo numa linha.
export const Inner = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    "logo end"
    "nav nav";
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  box-sizing: border-box;
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: auto 1fr auto;
    grid-template-areas: "logo nav end";
    column-gap: ${({ theme }) => theme.spacing(7)};
    padding: ${({ theme }) => `${theme.spacing(3.5)} ${theme.spacing(6)}`};
  }
`;

export const LogoLink = styled(Link)`
  grid-area: logo;
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.small};
  text-decoration: none;
`;

export const Nav = styled.nav`
  grid-area: nav;
  display: flex;
  overflow-x: auto;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const NavLink = styled(Link)<{ $isActive: boolean }>`
  ${({ theme, $isActive }) => css`
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 ${theme.spacing(3.5)};
    border-radius: ${theme.radii.control};
    background-color: ${$isActive ? theme.brand.raised : "transparent"};
    box-shadow: ${$isActive && theme.context !== "general" ? `inset 0 -2px 0 ${theme.accent.base}` : "none"};
    color: ${$isActive ? theme.brand.steel : theme.brand.steelMuted};
    font-size: 15px;
    font-weight: ${$isActive ? 600 : 500};
    text-decoration: none;
    transition:
      background-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    &:hover {
      color: ${theme.brand.steel};
    }
  `}
`;

export const End = styled.div`
  grid-area: end;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(3)};
`;
