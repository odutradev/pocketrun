import styled, { css } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(5)};
  }
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

export const Value = styled.span<{ $isText: boolean }>`
  ${({ theme, $isText }) => css`
    font-family: ${theme.brand.fonts.display};
    font-weight: ${$isText ? 600 : 800};
    font-size: ${$isText ? "17px" : "26px"};
    line-height: ${$isText ? 1.25 : 1};
    letter-spacing: ${$isText ? "-0.01em" : "-0.04em"};
    color: ${theme.brand.steel};

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${$isText ? "20px" : "32px"};
    }
  `}
`;

export const Hint = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
