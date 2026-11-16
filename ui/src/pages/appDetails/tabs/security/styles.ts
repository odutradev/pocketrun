import { Text } from "@radix-ui/themes";
import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const CheckboxRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const CheckboxLabel = styled(Text)`
  cursor: pointer;
`;
