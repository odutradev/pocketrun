import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.narrowWidth};
  margin: 0 auto;
`;
