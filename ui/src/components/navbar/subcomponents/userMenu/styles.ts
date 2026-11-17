import { DropdownMenu } from "@radix-ui/themes";
import styled from "styled-components";

export const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.brand.raised};
  color: ${({ theme }) => theme.brand.steel};
  font-family: ${({ theme }) => theme.brand.fonts.body};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.brand.steelMuted};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 2px;
  }
`;

export const Content = styled(DropdownMenu.Content)`
  && {
    min-width: 240px;
    border: 1px solid ${({ theme }) => theme.brand.border};
    border-radius: ${({ theme }) => theme.radii.box};
    background-color: ${({ theme }) => theme.brand.surface};
    box-shadow: ${({ theme }) => theme.brand.overlayShadow};
  }
`;

export const Identity = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)} ${theme.spacing(3)}`};
`;

export const Name = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Email = styled.span`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
  overflow-wrap: anywhere;
`;
