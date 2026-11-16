import { IconButton } from "@radix-ui/themes";
import styled from "styled-components";

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const BadgeContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const CloseButton = styled(IconButton)`
  cursor: pointer;
`;
