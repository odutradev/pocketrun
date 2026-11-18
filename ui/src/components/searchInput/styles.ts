import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const Container = styled.div`
  position: relative;
  min-width: 0;

  input::-webkit-search-cancel-button {
    appearance: none;
  }
`;

export const Spinner = styled.span`
  display: block;
  width: 15px;
  height: 15px;
  border: 2px solid ${({ theme }) => theme.accent.base};
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} ${({ theme }) => theme.motion.loop / 2}ms linear infinite;
`;
