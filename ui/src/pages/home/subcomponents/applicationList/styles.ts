import { Text } from "@radix-ui/themes";
import styled from "styled-components";

export const EmptyContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(12)} ${({ theme }) => theme.spacing(5)};
  color: ${({ theme }) => theme.palette.gray.icon};

  & > svg {
    width: ${({ theme }) => theme.spacing(10)};
    height: ${({ theme }) => theme.spacing(10)};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }
`;

export const EmptyDescription = styled(Text)`
  max-width: 420px;
`;
