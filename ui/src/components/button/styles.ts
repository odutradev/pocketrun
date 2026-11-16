import { Button } from "@radix-ui/themes";
import styled from "styled-components";

export const StyledButton = styled(Button)<{ $fullWidth: boolean }>`
  cursor: pointer;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};

  &:disabled {
    cursor: not-allowed;
  }
`;
