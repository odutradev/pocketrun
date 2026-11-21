import styled from "styled-components";

export const FileInput = styled.input`
  display: none;
`;

export const FileSummary = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  > div {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};
    min-width: 0;
  }

  dt {
    font-size: 12px;
    color: ${({ theme }) => theme.brand.steelMuted};
  }

  dd {
    margin: 0;
    font-weight: 600;
    overflow-wrap: anywhere;
  }
`;
