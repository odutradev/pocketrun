import { Select as RadixSelect } from "@radix-ui/themes";
import styled, { css } from "styled-components";

export const ProtocolSlot = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.brand.border};
  background-color: ${({ theme }) => theme.brand.raised};
`;

export const ProtocolTrigger = styled(RadixSelect.Trigger)`
  ${({ theme }) => css`
    && {
      height: 100%;
      margin: 0;
      padding: 0 ${theme.spacing(3)};
      gap: ${theme.spacing(2)};
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      color: ${theme.brand.steel};
      font-family: ${theme.brand.fonts.mono};
      font-size: 13px;
      cursor: pointer;
    }

    &&:hover {
      background-color: ${theme.brand.border};
    }

    &&:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: -2px;
    }

    && svg {
      color: ${theme.brand.steelMuted};
    }
  `}
`;

export const ProtocolContent = styled(RadixSelect.Content)`
  ${({ theme }) => css`
    && {
      border: 1px solid ${theme.brand.strongBorder};
      border-radius: ${theme.radii.control};
      background-color: ${theme.brand.surface};
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    }
  `}
`;

export const ProtocolItem = styled(RadixSelect.Item)`
  ${({ theme }) => css`
    && {
      height: 36px;
      padding-left: ${theme.spacing(7)};
      border-radius: ${theme.radii.small};
      color: ${theme.brand.steel};
      font-family: ${theme.brand.fonts.mono};
      font-size: 13px;
      cursor: pointer;
    }

    &&[data-highlighted] {
      background-color: ${theme.brand.raised};
    }

    && .rt-SelectItemIndicator {
      color: ${theme.accent.text};
    }
  `}
`;
