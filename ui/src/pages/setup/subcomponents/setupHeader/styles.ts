import { Heading, Text } from "@radix-ui/themes";
import styled from "styled-components";

export const Container = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

export const IconBox = styled.div`
  width: ${({ theme }) => theme.spacing(10)};
  height: ${({ theme }) => theme.spacing(10)};
  margin: 0 auto ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radius(3)};
  background-color: ${({ theme }) => theme.palette.primary.soft};
  border: 1px solid ${({ theme }) => theme.palette.primary.strong};
  color: ${({ theme }) => theme.palette.primary.text};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: ${({ theme }) => theme.spacing(5)};
    height: ${({ theme }) => theme.spacing(5)};
  }
`;

export const Title = styled(Heading)`
  letter-spacing: ${({ theme }) => theme.typography.tightLetterSpacing};
`;

export const Subtitle = styled(Text)`
  line-height: 1.5;
`;
