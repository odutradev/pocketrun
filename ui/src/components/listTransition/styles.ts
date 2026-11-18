import styled, { keyframes } from "styled-components";

const contentIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Frame = styled.div<{ $isBusy: boolean }>`
  opacity: ${({ $isBusy }) => ($isBusy ? 0.45 : 1)};
  pointer-events: ${({ $isBusy }) => ($isBusy ? "none" : "auto")};
  transition: opacity ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};
`;

export const Content = styled.div`
  animation: ${contentIn} ${({ theme }) => `${theme.motion.base}ms ${theme.motion.easing.standard}`};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
