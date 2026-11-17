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
  blur: "blur(16px)",
  // Durações em milissegundos.
  motion: {
    fast: 150,
    base: 250,
    expressive: 560,
    stagger: 90,
    loop: 1400,
    pulse: 2000,
    easing: {
      snap: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      standard: "cubic-bezier(0.2, 0, 0, 1)"
    }
  },
  brand: {
    graphite: "#111111",
    surface: "#191919",
    raised: "#222222",
    border: "#3A3A3A",
    strongBorder: "#484848",
    steel: "#EEEEEE",
    steelMuted: "#B4B4B4",
    paper: "#FCFCFC",
    paperRaised: "#F0F0F0",
    paperBorder: "#D9D9D9",
    ink: "#202020",
    inkMuted: "#646464",
    white: "#FFFFFF",
    tools: {
      data: {
        base: "#3E63DD",
        text: "#9EB1FF",
        textOnLight: "#3A5BC7",
        logoOnLight: "#3A5BC7",
        contrast: "#FFFFFF",
        soft: "rgba(62, 99, 221, 0.18)"
      },
      content: {
        base: "#FFC53D",
        text: "#FFCA16",
        textOnLight: "#AB6400",
        logoOnLight: "#E8A317",
        contrast: "#21201C",
        soft: "rgba(255, 197, 61, 0.16)"
      },
      links: {
        base: "#46A758",
        text: "#71D083",
        textOnLight: "#2A7E3B",
        logoOnLight: "#2A7E3B",
        contrast: "#111111",
        soft: "rgba(70, 167, 88, 0.18)"
      }
    },
    states: {
      success: "#12A594",
      successText: "#0BD8B6",
      warning: "#F76B15",
      warningText: "#FFA057",
      error: "#E5484D",
      errorText: "#FF9592"
    },
    fonts: {
      display: "'Unbounded', sans-serif",
      body: "'Hanken Grotesk', sans-serif",
      mono: "'Space Mono', monospace"
    }
  }
};

export type AppTheme = typeof theme;

export default theme;
