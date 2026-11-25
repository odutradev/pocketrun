import styled from "styled-components";

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Row = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing(3)} 0`};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) minmax(180px, 240px) auto;
  }
`;

export const RowMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const RowName = styled.span`
  overflow: hidden;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const RowPin = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.brand.steel};
`;

export const RowMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const RowRole = styled.div`
  grid-column: 1 / -1;
  grid-row: 2;
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-column: 2;
    grid-row: 1;
  }
`;

export const RowActions = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
