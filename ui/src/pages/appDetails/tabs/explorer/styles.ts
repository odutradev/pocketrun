import styled from "styled-components";

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: start;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: 220px minmax(0, 1fr) 320px;
  }
`;

export const DocumentsBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const DetailSlot = styled.div`
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-column: 1 / -1;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-column: auto;
    position: sticky;
    top: ${({ theme }) => theme.spacing(24)};
  }
`;

export const IdText = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  color: ${({ theme }) => theme.accent.text};
  white-space: nowrap;
`;

export const DataSummary = styled.span`
  display: block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
`;

export const MutedText = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;
