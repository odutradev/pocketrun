import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

const sidebarWidth = "264px";

// Ponto de contexto 1: dentro de uma ferramenta, a barra ganha o traço de 3 px no topo.
const contextStroke = css`
  box-shadow: ${({ theme }) => (theme.context === "general" ? "none" : `inset 0 3px 0 ${theme.accent.base}`)};
`;

export const MobileBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  min-height: 56px;
  box-sizing: border-box;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.graphite};
  ${contextStroke}

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

export const Backdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 55;
  background-color: ${({ theme }) => theme.brand.overlay};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  transition: opacity ${({ theme }) => `${theme.motion.base}ms ${theme.motion.easing.standard}`};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Aside = styled.aside<{ $isOpen: boolean }>`
  ${({ theme, $isOpen }) => css`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 60;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: ${theme.spacing(6)};
    width: ${sidebarWidth};
    max-width: 85vw;
    height: 100dvh;
    box-sizing: border-box;
    padding: ${theme.spacing(5)} ${theme.spacing(3)} ${theme.spacing(4)};
    overflow-y: auto;
    border-right: 1px solid ${theme.brand.border};
    background-color: ${theme.brand.surface};
    transform: translateX(${$isOpen ? "0" : "-100%"});
    visibility: ${$isOpen ? "visible" : "hidden"};
    transition:
      transform ${theme.motion.base}ms ${theme.motion.easing.standard},
      visibility ${theme.motion.base}ms;

    @media (min-width: ${theme.breakpoints.lg}) {
      position: sticky;
      z-index: 1;
      flex-shrink: 0;
      max-width: none;
      height: 100vh;
      transform: none;
      visibility: visible;
      transition: none;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `}
  ${contextStroke}
`;

export const Top = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(7)};
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

export const CloseSlot = styled.span`
  display: inline-flex;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

export const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.small};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 4px;
  }
`;

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

export const NavGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const GroupLabel = styled.span`
  padding: ${({ theme }) => `0 ${theme.spacing(3)} ${theme.spacing(1.5)}`};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

// Ponto de contexto 3: o item ativo ganha o traço à esquerda na cor do contexto.
export const NavLink = styled(Link)<{ $isActive: boolean }>`
  ${({ theme, $isActive }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing(3)};
    min-height: 44px;
    padding: 0 ${theme.spacing(3)};
    border-radius: ${theme.radii.tight};
    background-color: ${$isActive ? theme.brand.raised : "transparent"};
    box-shadow: ${$isActive ? `inset 3px 0 0 ${theme.accent.base}` : "none"};
    color: ${$isActive ? theme.brand.steel : theme.brand.steelMuted};
    font-size: 15px;
    font-weight: ${$isActive ? 600 : 500};
    text-decoration: none;
    transition:
      background-color ${theme.motion.fast}ms ${theme.motion.easing.standard},
      color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    span {
      display: inline-flex;
    }

    &:hover {
      background-color: ${theme.brand.raised};
      color: ${theme.brand.steel};
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 2px;
    }

    @media (min-width: ${theme.breakpoints.lg}) {
      min-height: 40px;
    }
  `}
`;

export const ItemBadge = styled.span`
  margin-left: auto;
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.brand.raised};
  color: ${({ theme }) => theme.brand.steelMuted};
  font-size: 12px;
  font-weight: 600;
`;

export const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  border-top: 1px solid ${({ theme }) => theme.brand.border};

  > [role="status"] {
    margin-left: ${({ theme }) => theme.spacing(2)};
  }
`;
