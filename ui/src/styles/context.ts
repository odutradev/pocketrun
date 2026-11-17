import { createGlobalStyle } from "styled-components";

// Cor do contexto da página para o que vive fora da árvore do tema, como a barra de rolagem da janela.
// O ":root:root" vence o valor padrão do global.ts independentemente da ordem de injeção.
const ContextStyles = createGlobalStyle`
  :root:root {
    --scrollbar-thumb: color-mix(in srgb, ${({ theme }) => theme.accent.base} 40%, transparent);
    --scrollbar-thumb-hover: color-mix(in srgb, ${({ theme }) => theme.accent.base} 65%, transparent);
  }
`;

export default ContextStyles;
