import styled from "styled-components";

export const TokenRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(5)};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1.4fr);
    align-items: center;
    gap: ${({ theme }) => theme.spacing(4)};
  }
`;

export const TokenName = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steel};
`;

export const TokenValue = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
  overflow-wrap: anywhere;
`;

export const Demo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(5)};
  width: 100%;
`;

export const Hint = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
