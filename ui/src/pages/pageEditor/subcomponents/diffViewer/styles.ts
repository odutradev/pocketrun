import styled from "styled-components";

export const Container = styled.div`
  height: 60vh;
  min-height: 360px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.graphite};
`;
