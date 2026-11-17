import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SecretBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.brand.strongBorder};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.graphite};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

export const Label = styled.span`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Secret = styled.code`
  display: block;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steel};
  word-break: break-all;
`;
