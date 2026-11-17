import styled from "styled-components";

export const Row = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;
