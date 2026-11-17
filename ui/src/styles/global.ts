import { createGlobalStyle } from "styled-components";

// Base escura do painel e ajuste das primitivas do Radix e dos toasts à identidade visual.
const GlobalStyles = createGlobalStyle`
  ${({ theme }) => `
    html {
      color-scheme: dark;
    }

    body {
      margin: 0;
      background-color: ${theme.brand.graphite};
      color: ${theme.brand.steel};
      font-family: ${theme.brand.fonts.body};
      -webkit-font-smoothing: antialiased;
    }

    .radix-themes {
      --default-font-family: ${theme.brand.fonts.body};
      --heading-font-family: ${theme.brand.fonts.body};
      --code-font-family: ${theme.brand.fonts.mono};
      --color-background: ${theme.brand.graphite};
      --color-panel-solid: ${theme.brand.surface};
      --color-panel-translucent: ${theme.brand.surface};
      --color-overlay: ${theme.brand.overlay};
      --cursor-button: pointer;
      --cursor-menu-item: pointer;
    }

    ::selection {
      background-color: ${theme.accent.soft};
    }

    :focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 2px;
    }

    .Toastify {
      --toastify-color-dark: ${theme.brand.raised};
      --toastify-text-color-dark: ${theme.brand.steel};
      --toastify-font-family: ${theme.brand.fonts.body};
      --toastify-color-success: ${theme.brand.states.success};
      --toastify-color-error: ${theme.brand.states.error};
      --toastify-color-warning: ${theme.brand.states.warning};
      --toastify-color-info: ${theme.brand.steelMuted};
      --toastify-color-progress-dark: ${theme.brand.steelMuted};
    }

    .Toastify__toast {
      border: 1px solid ${theme.brand.border};
      border-radius: ${theme.radii.box};
      font-size: 14px;
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}
`;

export default GlobalStyles;
