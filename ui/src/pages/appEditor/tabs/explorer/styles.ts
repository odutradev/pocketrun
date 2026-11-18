import styled from "styled-components";

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(5)};
  align-items: start;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 220px minmax(0, 1fr);
  }

`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  > * {
    flex: 1;
    min-width: 0;
  }
`;

export const CollectionName = styled.span`
  overflow: hidden;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  min-width: 0;
`;

export const IdText = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  color: ${({ theme }) => theme.accent.text};
  white-space: nowrap;
`;

export const DataSummary = styled.span`
  display: block;
  overflow: hidden;
  max-width: 420px;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MutedText = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;
