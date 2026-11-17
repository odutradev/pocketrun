import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Label = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

export const Value = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: 32px;
  line-height: 1;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Hint = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
