import styled from "styled-components";

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
`;

export const Name = styled.span`
  font-weight: 600;
`;

export const Prefix = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  white-space: nowrap;
`;

export const MutedText = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;

export const Strong = styled.strong`
  color: ${({ theme }) => theme.brand.steel};
`;
