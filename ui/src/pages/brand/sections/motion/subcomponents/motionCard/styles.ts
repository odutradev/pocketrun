import styled from "styled-components";

import { Stage } from "../../../../styles";



export const CardStage = styled(Stage)`
  position: relative;
  min-height: 240px;
`;

export const ReplayButton = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(3)};
  right: ${({ theme }) => theme.spacing(3)};
`;

export const Specs = styled.dl`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(4)};
  margin: 0;
  font-size: 14px;
  line-height: 1.5;

  dt {
    color: ${({ theme }) => theme.brand.steelMuted};
  }

  dd {
    margin: 0;
    color: ${({ theme }) => theme.brand.steel};
  }
`;
