import styled from "styled-components";

export const Container = styled.div<{ $isCentered: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme, $isCentered }) => ($isCentered ? `${theme.spacing(16)} 0` : 0)};
  min-height: ${({ $isCentered }) => ($isCentered ? "40vh" : "auto")};
`;
