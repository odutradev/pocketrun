import { Heading } from "@radix-ui/themes";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

export const Title = styled(Heading)`
  letter-spacing: ${({ theme }) => theme.typography.tightLetterSpacing};
`;

export const Highlight = styled.strong`
  color: ${({ theme }) => theme.palette.gray.contrast};
`;

export const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;
