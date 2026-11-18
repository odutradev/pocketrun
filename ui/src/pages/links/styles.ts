import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

export const ListArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  scroll-margin-top: ${({ theme }) => theme.spacing(6)};
`;

export const Toolbar = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

export const LinkCell = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
  max-width: 520px;
`;

export const Title = styled.span`
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Meta = styled.span`
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
  max-width: 240px;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "→ ";
  }
`;

export const StateCell = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StateDetail = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;

export const Clicks = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  white-space: nowrap;
`;

export const ClicksLimit = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const RowActions = styled.span`
  display: inline-flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
