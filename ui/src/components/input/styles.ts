import { IconButton, Text } from "@radix-ui/themes";
import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
`;

export const Label = styled(Text)`
  display: block;
  color: ${({ theme }) => theme.palette.gray.text};
`;

export const ErrorText = styled(Text)`
  display: block;
`;

export const ToggleButton = styled(IconButton)`
  cursor: pointer;
`;
