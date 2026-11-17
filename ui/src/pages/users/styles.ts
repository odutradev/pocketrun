import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

export const NameCell = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-weight: 600;
`;

export const Email = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
  overflow-wrap: anywhere;
`;

export const RowActions = styled.span`
  display: inline-flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
