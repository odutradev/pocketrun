import { Dialog } from "@radix-ui/themes";
import styled from "styled-components";

// Os `&&` vencem a especificidade das classes do Radix Themes.
export const Content = styled(Dialog.Content)`
  && {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(5)};
    padding: ${({ theme }) => theme.spacing(6)};
    border: 1px solid ${({ theme }) => theme.brand.border};
    border-radius: ${({ theme }) => theme.radii.card};
    background-color: ${({ theme }) => theme.brand.surface};
    box-shadow: ${({ theme }) => theme.brand.overlayShadow};
    color: ${({ theme }) => theme.brand.steel};

    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      padding: ${({ theme }) => theme.spacing(7)};
    }
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

export const Eyebrow = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Title = styled(Dialog.Title)`
  && {
    margin: 0;
    font-family: ${({ theme }) => theme.brand.fonts.display};
    font-weight: 800;
    font-size: 22px;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: ${({ theme }) => theme.brand.steel};
  }
`;

export const Description = styled(Dialog.Description)`
  && {
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    color: ${({ theme }) => theme.brand.steelMuted};
  }
`;

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;
