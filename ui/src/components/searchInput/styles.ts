import styled from "styled-components";

export const Container = styled.div`
  min-width: 0;

  input::-webkit-search-cancel-button {
    appearance: none;
  }
`;

export const Status = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const LoaderSlot = styled.span`
  display: inline-flex;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;
