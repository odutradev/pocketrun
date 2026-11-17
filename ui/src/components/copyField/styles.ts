import styled from "styled-components";

export const Container = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 100%;
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(3)}`};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.control};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const Value = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steel};
`;
