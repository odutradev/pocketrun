import styled from "styled-components";

export const Container = styled.div`
  height: 420px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: 560px;
  }
`;
