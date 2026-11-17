import styled from "styled-components";

import type { BrandContext } from "@utils/types/brand";

import { Panel } from "../../styles";

export const Stages = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(2)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const ContextPanel = styled(Panel)<{ $context: BrandContext }>`
  box-shadow: inset 0 3px 0
    ${({ theme, $context }) => ($context === "general" ? theme.brand.border : theme.brand.tools[$context].base)};
`;
