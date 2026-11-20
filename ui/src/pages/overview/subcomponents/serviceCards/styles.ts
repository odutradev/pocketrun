import { Link } from "react-router-dom";
import styled from "styled-components";

import type { ServiceToolStyleProps } from "./types";

export const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing(4)};
  }
`;

export const Card = styled(Link)<ServiceToolStyleProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.surface};
  color: inherit;
  text-decoration: none;
  transition:
    border-color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`},
    background-color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  &:hover {
    border-color: ${({ theme, $tool }) => theme.brand.tools[$tool].base};
    background-color: ${({ theme }) => theme.brand.raised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme, $tool }) => theme.brand.tools[$tool].base};
    outline-offset: 2px;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const IconBox = styled.span<ServiceToolStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ theme }) => theme.spacing(9)};
  height: ${({ theme }) => theme.spacing(9)};
  border-radius: ${({ theme }) => theme.radii.control};
  background-color: ${({ theme, $tool }) => theme.brand.tools[$tool].soft};
  color: ${({ theme, $tool }) => theme.brand.tools[$tool].text};
`;

export const Name = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-size: 15px;
  font-weight: 600;
`;

export const Description = styled.span`
  display: block;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Facts = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
`;

export const Fact = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

export const FactValue = styled.dd<ServiceToolStyleProps>`
  order: -1;
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme, $tool }) => theme.brand.tools[$tool].text};
`;

export const FactLabel = styled.dt`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Open = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: auto;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
`;
