import styled from "styled-components";

export const Container = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const Logo = styled.div`
  width: ${({ theme }) => theme.spacing(12)};
  height: ${({ theme }) => theme.spacing(12)};
  margin: 0 auto ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radius(3)};
  background: ${({ theme }) => theme.palette.primary.gradient};
  box-shadow: 0 6px 20px ${({ theme }) => theme.palette.primary.strong};
  color: ${({ theme }) => theme.palette.primary.contrast};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: ${({ theme }) => theme.spacing(6)};
    height: ${({ theme }) => theme.spacing(6)};
  }
`;
