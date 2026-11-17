import styled from "styled-components";

export const Code = styled.code`
  padding: 1px ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.radii.small};
  background-color: ${({ theme }) => theme.brand.raised};
  color: ${({ theme }) => theme.brand.steel};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
`;
