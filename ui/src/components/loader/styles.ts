import styled, { css } from "styled-components";

export const Container = styled.div<{ $isCentered: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ theme, $isCentered }) =>
    $isCentered &&
    css`
      flex: 1;
      align-self: stretch;
      min-height: 40vh;
      padding: ${theme.spacing(16)} 0;
    `}
`;
