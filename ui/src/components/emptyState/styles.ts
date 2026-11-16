import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(8)} 0;
  text-align: center;
  color: ${({ theme }) => theme.palette.gray.icon};

  svg {
    width: ${({ theme }) => theme.spacing(8)};
    height: ${({ theme }) => theme.spacing(8)};
  }
`;
