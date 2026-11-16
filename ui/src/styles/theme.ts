import type { ThemeProps } from "@radix-ui/themes";

export const radixTheme: ThemeProps = {
  accentColor: "mint",
  grayColor: "sage",
  radius: "medium",
  scaling: "100%"
};

export const theme = {
  palette: {
    primary: {
      main: "var(--mint-9)",
      text: "var(--mint-11)",
      soft: "var(--mint-a3)",
      border: "var(--mint-a4)",
      strong: "var(--mint-a5)",
      contrast: "var(--mint-contrast)",
      gradient: "linear-gradient(135deg, var(--mint-9) 0%, var(--mint-6) 100%)",
      glow: "radial-gradient(ellipse 80% 50% at 50% -20%, var(--mint-a4), transparent)"
    },
    success: {
      main: "var(--grass-9)",
      soft: "var(--grass-a3)"
    },
    danger: {
      main: "var(--ruby-9)",
      border: "var(--ruby-a6)"
    },
    gray: {
      soft: "var(--gray-a2)",
      muted: "var(--gray-a3)",
      border: "var(--gray-a4)",
      strongBorder: "var(--gray-a5)",
      icon: "var(--gray-8)",
      text: "var(--gray-11)",
      contrast: "var(--gray-12)"
    },
    background: {
      app: "var(--app-bg, var(--color-background))",
      panel: "var(--color-panel-translucent)"
    }
  },
  spacing: (factor: number) => `${factor * 4}px`,
  radius: (level: 1 | 2 | 3 | 4 | 5 | 6 | "full") => `var(--radius-${level})`,
  shadow: (level: 1 | 2 | 3 | 4 | 5 | 6) => `var(--shadow-${level})`,
  breakpoints: {
    sm: "520px",
    md: "768px",
    lg: "1024px"
  },
  layout: {
    maxWidth: "1280px",
    narrowWidth: "460px",
    headerHeight: "80px"
  },
  typography: {
    mono: "'JetBrains Mono', monospace",
    codeSize: "12px",
    tightLetterSpacing: "-0.02em"
  },
  blur: "blur(16px)"
};

export type AppTheme = typeof theme;

export default theme;
