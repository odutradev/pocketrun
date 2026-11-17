export type BrandTool = "data" | "content" | "links";

export type BrandContext = "general" | BrandTool;

export type SymbolVariant = "full" | "bold" | "tiny";

export type LogoKind = "horizontal" | "stacked" | "symbol" | "wordmark" | "appIcon";

export type LogoPalette = "dark" | "light" | "monoWhite" | "monoInk";

export type LogoBackground = "transparent" | "graphite" | "paper" | "white";

export type LogoAspect = "original" | "1:1" | "4:5" | "16:9" | "1.91:1" | "9:16" | "3:1";

export type RasterFormat = "png" | "webp" | "jpg";

export type RasterSize = 512 | 1024 | 2048 | 4096;

export type TypeFamily = "display" | "body" | "mono";

export interface LogoConfig {
  kind: LogoKind;
  context: BrandContext;
  palette: LogoPalette;
  background: LogoBackground;
  aspect: LogoAspect;
  size: RasterSize;
  format: RasterFormat;
}

export interface SymbolColors {
  blades: Record<BrandTool, string>;
  handle: string;
  word: string;
  run: [string, string, string];
}

export interface BuiltSvg {
  svg: string;
  width: number;
  height: number;
}

export interface BrandOption<T extends string | number> {
  value: T;
  label: string;
  description?: string;
}

export interface BrandColor {
  name: string;
  hex: string;
  token: string;
  role: string;
  description: string;
}

export interface BrandToolInfo {
  tool: BrandTool;
  name: string;
  colorName: string;
  route: string;
  status: "live" | "planned";
  origin: string;
  description: string;
}

export interface BrandTypeStep {
  label: string;
  family: TypeFamily;
  size: number;
  lineHeight: number;
  weight: number;
  sample: string;
  uppercase?: boolean;
}

export interface BrandToken {
  token: string;
  dark: string;
  light: string;
}

export interface BrandSection {
  id: string;
  number: string;
  label: string;
}

export interface SymbolPart {
  number: string;
  name: string;
  spec: string;
  description: string;
  tool?: BrandTool;
}

export interface OpticalSize {
  size: number;
  variant: SymbolVariant;
  label: string;
}

export interface IconPaletteInfo {
  palette: LogoPalette;
  name: string;
  description: string;
}

export interface FaviconItem {
  fileName: string;
  size: number;
  format: "svg" | "png";
  usage: string;
}

export interface QuickKitItem {
  id: string;
  title: string;
  description: string;
  config: LogoConfig;
}
