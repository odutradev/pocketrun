import styled, { css } from "styled-components";

export const Grid = styled.ul<{ $isCompact: boolean }>`
  ${({ theme, $isCompact }) => css`
    display: grid;
    gap: ${$isCompact ? 0 : theme.spacing(4)};
    margin: 0;
    padding: 0;
    list-style: none;

    ${$isCompact &&
    css`
      overflow: hidden;
      border: 1px solid ${theme.brand.border};
      border-radius: ${theme.radii.box};
      background-color: ${theme.brand.surface};
    `}

    @media (min-width: ${theme.breakpoints.md}) {
      grid-template-columns: ${$isCompact ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))"};
    }
  `}
`;

export const CardItem = styled.li<{ $isCompact: boolean }>`
  ${({ theme, $isCompact }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing($isCompact ? 2 : 3)};
    min-width: 0;
    padding: ${$isCompact ? `${theme.spacing(3.5)} ${theme.spacing(4)}` : theme.spacing(5)};
    border: ${$isCompact ? 0 : `1px solid ${theme.brand.border}`};
    border-radius: ${$isCompact ? 0 : theme.radii.box};
    background-color: ${theme.brand.surface};
    transition: border-color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    & + & {
      border-top: ${$isCompact ? `1px solid ${theme.brand.border}` : undefined};
    }

    &:hover {
      border-color: ${theme.brand.strongBorder};
    }
  `}
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};

  > :last-child {
    flex-shrink: 0;
  }
`;

export const Usage = styled.div<{ $isCompact: boolean }>`
  display: flex;
  flex-direction: ${({ $isCompact }) => ($isCompact ? "row" : "column")};
  flex-wrap: wrap;
  align-items: ${({ $isCompact }) => ($isCompact ? "baseline" : "flex-start")};
  gap: ${({ theme, $isCompact }) => ($isCompact ? theme.spacing(2) : 0)};
  min-width: 0;
`;

export const Title = styled.h3`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Body = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  min-width: 0;
  font-size: 13px;
`;

export const Slug = styled.a`
  border-radius: ${({ theme }) => theme.radii.small};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  color: ${({ theme }) => theme.accent.text};
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
  transition: text-decoration-color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  &:hover {
    text-decoration-color: currentColor;
  }
`;

export const Host = styled.span`
  overflow: hidden;
  max-width: 100%;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "→ ";
  }
`;

export const Footer = styled.div<{ $isCompact: boolean }>`
  ${({ theme, $isCompact }) => css`
    display: flex;
    align-items: ${$isCompact ? "center" : "flex-end"};
    justify-content: space-between;
    gap: ${theme.spacing(3)};
    margin-top: auto;
    padding-top: ${$isCompact ? 0 : theme.spacing(3)};
    border-top: ${$isCompact ? 0 : `1px solid ${theme.brand.border}`};
  `}
`;

export const Clicks = styled.p<{ $isCompact: boolean }>`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  margin-bottom: ${({ theme, $isCompact }) => ($isCompact ? 0 : theme.spacing(1))};
  font-size: ${({ $isCompact }) => ($isCompact ? "15px" : "22px")};
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

export const ClicksLabel = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Rule = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Actions = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;
