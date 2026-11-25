import styled from "styled-components";

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const LoaderBox = styled.div`
  height: 420px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: 560px;
  }
`;

export const FieldList = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  font-size: 13px;
  line-height: 1.5;

  dt {
    font-family: ${({ theme }) => theme.brand.fonts.mono};
    font-size: 12px;
    color: ${({ theme }) => theme.brand.steel};
  }

  dd {
    margin: 0 0 ${({ theme }) => theme.spacing(1)};
    color: ${({ theme }) => theme.brand.steelMuted};
  }
`;
