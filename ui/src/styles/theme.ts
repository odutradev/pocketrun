import type { AccentColors, GroupColorTokens } from "./types";
import type { BrandContext } from "@utils/types/brand";
import type { GroupColor } from "@utils/types/link";
import type { ThemeProps } from "@radix-ui/themes";

export const radixTheme: ThemeProps = {
  appearance: "dark",
  accentColor: "gray",
  grayColor: "gray",
  radius: "medium",
  scaling: "100%",
  hasBackground: false
};

const generalAccent: AccentColors = {
  base: "#EEEEEE",
  text: "#EEEEEE",
  soft: "rgba(238, 238, 238, 0.12)",
  contrast: "#111111"
};

const groupColors: Record<GroupColor, GroupColorTokens> = {
  gray: { base: "#8D8D8D", text: "#B4B4B4", soft: "rgba(180, 180, 180, 0.12)" },
  red: { base: "#E54D2E", text: "#FF977D", soft: "rgba(229, 77, 46, 0.18)" },
  orange: { base: "#F76B15", text: "#FFA057", soft: "rgba(247, 107, 21, 0.18)" },
  yellow: { base: "#FFE629", text: "#F5E147", soft: "rgba(255, 230, 41, 0.14)" },
  green: { base: "#29A383", text: "#1FD8A4", soft: "rgba(41, 163, 131, 0.18)" },
  blue: { base: "#0090FF", text: "#70B8FF", soft: "rgba(0, 144, 255, 0.18)" },
  purple: { base: "#8E4EC6", text: "#D19DFF", soft: "rgba(142, 78, 198, 0.22)" },
  pink: { base: "#D6409F", text: "#FF8DCC", soft: "rgba(214, 64, 159, 0.18)" }
};

const codeColors = {
  key: groupColors.blue.text,
  string: "#71D083",
  number: groupColors.orange.text,
  literal: groupColors.orange.text,
  keyword: groupColors.purple.text,
  function: groupColors.yellow.text,
  comment: "#7B7B7B",
  punctuation: "#8D8D8D",
  plain: "#E2E2E2",
  background: "#0E0E0E",
  scrollbar: "#3A3A3A",
  scrollbarHover: "#5A5A5A"
};

const baseTheme = {
  spacing: (factor: number) => `${factor * 4}px`,
  radii: {
    tight: "4px",
    small: "8px",
    control: "10px",
    box: "12px",
    panel: "16px",
    card: "20px",
    pill: "999px"
  },
  breakpoints: {
    sm: "520px",
    md: "768px",
    lg: "1024px",
    xl: "1200px"
  },
  layout: {
    maxWidth: "1280px",
    formWidth: "420px",
    setupWidth: "520px"
  },
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
      successSoft: "rgba(18, 165, 148, 0.16)",
      warning: "#F76B15",
      warningText: "#FFA057",
      warningSoft: "rgba(247, 107, 21, 0.16)",
      error: "#E5484D",
      errorText: "#FF9592",
      errorSoft: "rgba(229, 72, 77, 0.12)",
      errorBorder: "rgba(229, 72, 77, 0.55)",
      errorTint: "#FFD1CF"
    },
    general: generalAccent,
    groups: groupColors,
    chart: {
      clicks: "#46A758",
      visitors: "#5B7BE6",
      marker: "#B4B4B4",
      devices: {
        desktop: "#46A758",
        mobile: "#5B7BE6",
        tablet: "#D6409F"
      } as Record<string, string>
    },
    code: codeColors,
    overlay: "rgba(0, 0, 0, 0.66)",
    overlayShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
    fonts: {
      display: "'Unbounded', sans-serif",
      body: "'Hanken Grotesk', sans-serif",
      mono: "'Space Mono', monospace"
    }
  }
};

const pickAccent = (context: BrandContext): AccentColors =>
  context === "general" ? generalAccent : baseTheme.brand.tools[context];

export const withContext = (context: BrandContext) => ({ ...baseTheme, context, accent: pickAccent(context) });

export const theme = withContext("general");

export default theme;
