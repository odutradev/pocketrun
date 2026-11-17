import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

export const Toolbar = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: end;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) 240px;
  }
`;

export const TitleCell = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

export const Title = styled.span`
  font-weight: 600;
`;

export const Slug = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.accent.text};
`;

export const Destination = styled.span`
  display: block;
  max-width: 280px;
  overflow: hidden;
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-overflow: ellipsis;
  white-space: nowrap;
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
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const RowActions = styled.span`
  display: inline-flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
