import styled, { keyframes } from "styled-components";

import type { SkeletonRadius } from "./types";

const shimmer = keyframes`
  0% { opacity: 0.55; }
  50% { opacity: 1; }
  100% { opacity: 0.55; }
`;

export const Block = styled.span<{ $width: string; $height: string; $radius: SkeletonRadius }>`
  display: block;
  width: ${({ $width }) => $width};
  max-width: 100%;
  height: ${({ $height }) => $height};
  border-radius: ${({ theme, $radius }) => theme.radii[$radius]};
  background-color: ${({ theme }) => theme.brand.raised};
  animation: ${shimmer} ${({ theme }) => theme.motion.pulse}ms ease-in-out infinite;
`;
