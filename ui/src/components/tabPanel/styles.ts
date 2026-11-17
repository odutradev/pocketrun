import styled from "styled-components";

export const Panel = styled.div`
  min-width: 0;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 4px;
    border-radius: ${({ theme }) => theme.radii.small};
  }
`;
