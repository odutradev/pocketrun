import { Text } from "@radix-ui/themes";
import styled from "styled-components";

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.palette.danger.main};

  & > svg {
    flex-shrink: 0;
    width: ${({ theme }) => theme.spacing(6)};
    height: ${({ theme }) => theme.spacing(6)};
  }
`;

export const Confirmation = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const BlockText = styled(Text)`
  display: block;
`;
