import styled from "styled-components";

export const RoleList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const RoleItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => `${theme.spacing(3)} 0`};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const RoleMain = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

export const RoleHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

export const RoleName = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
  overflow-wrap: anywhere;
`;

export const RoleDescription = styled.span`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const RuleList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: ${({ theme }) => `${theme.spacing(1)} 0 0`};
  padding: 0;
  list-style: none;
`;

export const RuleLine = styled.li`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.accent.text};
  overflow-wrap: anywhere;
`;

export const RoleActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const Strong = styled.strong`
  color: ${({ theme }) => theme.brand.steel};
`;
