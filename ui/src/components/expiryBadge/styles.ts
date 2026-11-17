import styled from "styled-components";

export const MutedText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;
