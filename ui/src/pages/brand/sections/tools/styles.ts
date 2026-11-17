import styled from "styled-components";

import { Panel } from "../../styles";

import type { BrandTool } from "@utils/types/brand";



export const ToolPanel = styled(Panel)<{ $tool: BrandTool }>`
  box-shadow: inset 0 3px 0 ${({ theme, $tool }) => theme.brand.tools[$tool].base};
`;

export const ToolHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Status = styled.span<{ $isLive: boolean }>`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(3)};
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background-color: ${({ theme }) => theme.brand.raised};
  color: ${({ theme, $isLive }) => ($isLive ? theme.brand.states.successText : theme.brand.steelMuted)};
`;

export const Route = styled.span<{ $tool: BrandTool }>`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  color: ${({ theme, $tool }) => theme.brand.tools[$tool].text};
`;

export const Writing = styled.p`
  margin: 0;
  min-height: 72px;
  display: flex;
  align-items: center;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -0.02em;
`;
