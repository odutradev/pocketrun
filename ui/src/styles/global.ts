import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  ${({ theme }) => `
    html {
      color-scheme: dark;
      scrollbar-gutter: stable;
    }

    :root {
      --scrollbar-thumb: color-mix(in srgb, ${theme.accent.base} 40%, transparent);
      --scrollbar-thumb-hover: color-mix(in srgb, ${theme.accent.base} 65%, transparent);
    }

    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-corner {
      background-color: ${theme.brand.graphite};
    }

    ::-webkit-scrollbar-thumb {
      border-radius: ${theme.radii.pill};
      background-color: var(--scrollbar-thumb);
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: var(--scrollbar-thumb-hover);
    }

    @supports (-moz-appearance: none) {
      * {
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-thumb) ${theme.brand.graphite};
      }
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

    .rt-TooltipContent {
      padding: ${theme.spacing(2.5)} ${theme.spacing(3)};
      border: 1px solid ${theme.brand.border};
      border-radius: ${theme.radii.control};
      background-color: ${theme.brand.raised};
    }

    .rt-TooltipText {
      color: ${theme.brand.steel};
    }

    .rt-TooltipArrow {
      fill: ${theme.brand.raised};
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
