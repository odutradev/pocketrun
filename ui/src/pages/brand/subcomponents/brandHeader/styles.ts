import styled from "styled-components";



export const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: ${({ theme }) => theme.brand.graphite};
  border-bottom: 1px solid ${({ theme }) => theme.brand.border};
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  max-width: 1180px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(3)};
  }
`;

export const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};

  a {
    text-decoration: none;
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  a:first-child {
    display: none;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    a:first-child {
      display: inline-flex;
    }
  }
`;

export const NavList = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const NavLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-shrink: 0;
  min-height: 36px;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.brand.border};
  color: ${({ theme }) => theme.brand.steel};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  span {
    font-family: ${({ theme }) => theme.brand.fonts.mono};
    font-weight: 400;
    font-size: 12px;
    color: ${({ theme }) => theme.brand.steelMuted};
  }

  &:hover,
  &:focus-visible {
    background-color: ${({ theme }) => theme.brand.raised};
  }
`;
