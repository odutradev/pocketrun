import styled from "styled-components";

export const TokenList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const TokenItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => `${theme.spacing(3)} 0`};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const TokenMain = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

export const TokenHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

export const TokenName = styled.span`
  overflow: hidden;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const TokenPrefix = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.accent.text};
`;

export const TokenMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Strong = styled.strong`
  color: ${({ theme }) => theme.brand.steel};
`;

export const TokenRole = styled.div`
  width: 100%;
  max-width: 220px;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;
