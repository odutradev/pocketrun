import { Card } from "@radix-ui/themes";
import styled, { css } from "styled-components";

import type { CardTone } from "./types";

const toneStyles: Record<CardTone, ReturnType<typeof css>> = {
  default: css``,
  dashed: css`
    border: 1px dashed ${({ theme }) => theme.palette.gray.strongBorder};
    text-align: center;
  `,
  danger: css`
    border: 1px solid ${({ theme }) => theme.palette.danger.border};
  `,
  interactive: css`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `
};

export const StyledCard = styled(Card)<{ $tone: CardTone }>`
  backdrop-filter: ${({ theme }) => theme.blur};
  background-color: ${({ theme }) => theme.palette.gray.soft};
  border-color: ${({ theme }) => theme.palette.gray.border};
  ${({ $tone }) => toneStyles[$tone]}
`;
