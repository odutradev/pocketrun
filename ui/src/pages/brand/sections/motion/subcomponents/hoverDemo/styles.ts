import styled from "styled-components";



export const Target = styled.div`
  display: inline-flex;
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: 16px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.brand.steel};
    outline-offset: 2px;
  }
`;
