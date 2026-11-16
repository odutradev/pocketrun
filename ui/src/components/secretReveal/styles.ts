import { Code } from "@radix-ui/themes";
import styled from "styled-components";

export const Container = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

export const IconCircle = styled.div`
  width: ${({ theme }) => theme.spacing(13)};
  height: ${({ theme }) => theme.spacing(13)};
  margin: 0 auto ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radius("full")};
  background-color: ${({ theme }) => theme.palette.success.soft};
  color: ${({ theme }) => theme.palette.success.main};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: ${({ theme }) => theme.spacing(6)};
    height: ${({ theme }) => theme.spacing(6)};
  }
`;

export const SecretBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: left;
  background-color: ${({ theme }) => theme.palette.gray.muted};
  border: 1px solid ${({ theme }) => theme.palette.gray.strongBorder};
  border-radius: ${({ theme }) => theme.radius(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

export const SecretCode = styled(Code)`
  word-break: break-all;
`;
