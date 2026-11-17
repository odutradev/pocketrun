import styled from "styled-components";

export const CreateForm = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const GroupList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(5)} 0 0;
  padding: 0;
  list-style: none;
`;

export const Empty = styled.p`
  margin: ${({ theme }) => theme.spacing(5)} 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
