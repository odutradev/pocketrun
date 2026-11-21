import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  min-width: 0;
`;

export const Layout = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(6)};
  align-items: start;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 200px minmax(0, 1fr);
  }
`;

export const Toc = styled.nav`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: sticky;
    top: ${({ theme }) => theme.spacing(6)};
    max-height: calc(100vh - ${({ theme }) => theme.spacing(12)});
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};
  }
`;

export const TocGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};

  & + & {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

export const TocTitle = styled.span`
  padding: ${({ theme }) => `0 ${theme.spacing(3)} ${theme.spacing(2)}`};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const TocLink = styled.a`
  padding: ${({ theme }) => `${theme.spacing(1.5)} ${theme.spacing(3)}`};
  border-radius: ${({ theme }) => theme.radii.control};
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-decoration: none;
  transition: background-color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  &:hover {
    background-color: ${({ theme }) => theme.brand.raised};
    color: ${({ theme }) => theme.brand.steel};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: -2px;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  min-width: 0;
`;

export const Paragraph = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Code = styled.code`
  padding: 1px ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.radii.small};
  background-color: ${({ theme }) => theme.brand.raised};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Bullets = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing(5)};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const CodeGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const Fields = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const RoutePath = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.accent.text};
  white-space: nowrap;
`;

export const MutedText = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;
