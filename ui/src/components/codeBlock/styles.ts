import styled from "styled-components";

export const Container = styled.div<{ $maxHeight?: string }>`
  padding: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.palette.gray.muted};
  border-radius: ${({ theme }) => theme.radius(3)};
  max-height: ${({ $maxHeight }) => $maxHeight ?? "none"};
  overflow: auto;
`;

export const Pre = styled.pre`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.codeSize};
  font-family: ${({ theme }) => theme.typography.mono};
`;
