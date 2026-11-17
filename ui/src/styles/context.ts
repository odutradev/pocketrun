import { createGlobalStyle } from "styled-components";

const ContextStyles = createGlobalStyle`
  :root:root {
    --scrollbar-thumb: color-mix(in srgb, ${({ theme }) => theme.accent.base} 40%, transparent);
    --scrollbar-thumb-hover: color-mix(in srgb, ${({ theme }) => theme.accent.base} 65%, transparent);
  }
`;

export default ContextStyles;
