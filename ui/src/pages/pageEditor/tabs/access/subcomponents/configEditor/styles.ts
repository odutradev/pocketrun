import styled from "styled-components";

export const EditorBox = styled.div`
  height: 420px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: 560px;
  }
`;

export const IssuedList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: ${({ theme }) => `${theme.spacing(2)} 0 0`};
  padding: 0;
  list-style: none;
`;

export const IssuedItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
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
