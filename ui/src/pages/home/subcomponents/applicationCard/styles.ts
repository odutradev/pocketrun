import { Text } from "@radix-ui/themes";
import styled from "styled-components";

export const Body = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Description = styled(Text)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Footer = styled(Row)`
  border-top: 1px solid ${({ theme }) => theme.palette.gray.border};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

export const Stats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Stat = styled(Text)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
