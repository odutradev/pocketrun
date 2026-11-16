import { Heading, Text } from "@radix-ui/themes";
import styled from "styled-components";

export const Container = styled.div`
  max-width: 860px;
  margin: ${({ theme }) => theme.spacing(6)} auto;
  text-align: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    margin: ${({ theme }) => theme.spacing(12)} auto;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(14)} ${({ theme }) => theme.spacing(8)};
  }
`;

export const Logo = styled.div`
  width: ${({ theme }) => theme.spacing(16)};
  height: ${({ theme }) => theme.spacing(16)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radius(4)};
  background: ${({ theme }) => theme.palette.primary.gradient};
  box-shadow: 0 8px 28px ${({ theme }) => theme.palette.primary.strong};
  color: ${({ theme }) => theme.palette.primary.contrast};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: ${({ theme }) => theme.spacing(8)};
    height: ${({ theme }) => theme.spacing(8)};
  }
`;

export const Title = styled(Heading)`
  letter-spacing: -0.03em;
`;

export const Description = styled(Text)`
  max-width: 580px;
  line-height: 1.6;
`;
