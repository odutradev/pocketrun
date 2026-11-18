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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const SearchSlot = styled.div`
  flex: 1 1 0;
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-basis: 240px;
  }
`;

export const Filters = styled.div`
  display: grid;
  flex: 1 1 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  order: 1;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex: 0 0 auto;
    grid-template-columns: repeat(2, 176px);
    order: 0;
  }
`;

export const Count = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const AppCell = styled.span`
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

export const ProjectId = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  color: ${({ theme }) => theme.accent.text};
`;

export const Description = styled.span`
  overflow: hidden;
  max-width: 320px;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "→ ";
  }
`;

export const Tokens = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  white-space: nowrap;
`;

export const MutedText = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;

export const RowActions = styled.span`
  display: inline-flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
