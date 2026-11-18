import styled from "styled-components";

export const Container = styled.div`
  flex: 1;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background-color: ${({ theme }) => theme.brand.graphite};
`;
