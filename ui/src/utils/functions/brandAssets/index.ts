import { brandWordmark } from "@assets/config";
import theme from "@styles/theme";

import type { BrandContext, BrandTool, BuiltSvg, LogoAspect, LogoBackground, LogoConfig, LogoKind, LogoPalette, RasterFormat, SymbolColors, SymbolVariant } from "@utils/types/brand";

const { brand } = theme;

export const symbolPivot = { x: 24, y: 70 } as const;

export const symbolBlades: { tool: BrandTool; angle: number; length: number }[] = [
  { tool: "links", angle: -82, length: 46 },
  { tool: "content", angle: -52, length: 54 },
  { tool: "data", angle: -22, length: 60 }
];

export const symbolBladeThickness: Record<SymbolVariant, number> = { full: 12, bold: 14, tiny: 18 };

export const symbolHandleHeight: Record<SymbolVariant, number> = { full: 20, bold: 22, tiny: 0 };

export const symbolHandle = { x: 12, width: 74, rivet: 4.5, tinyRadius: 15 } as const;

export const symbolViewBox = { x: 10, y: 20, width: 78, height: 62 } as const;

const aspectRatios: Record<LogoAspect, number | null> = {
  original: null,
  "1:1": 1,
  "4:5": 4 / 5,
  "16:9": 16 / 9,
  "1.91:1": 1.91,
  "9:16": 9 / 16,
  "3:1": 3
};

const backgroundColors: Record<LogoBackground, string | null> = {
  transparent: null,
  graphite: brand.graphite,
  paper: brand.paper,
  white: brand.white
};

const appIconBackgrounds: Record<LogoPalette, string> = {
  dark: brand.surface,
  light: brand.paper,
  monoWhite: brand.ink,
  monoInk: brand.white
};

const kindSlugs: Record<LogoKind, string> = {
  horizontal: "horizontal",
  stacked: "empilhada",
  symbol: "simbolo",
  wordmark: "logotipo",
  appIcon: "icone"
};

const paletteSlugs: Record<LogoPalette, string> = {
  dark: "escuro",
  light: "claro",
  monoWhite: "mono-branco",
  monoInk: "mono-tinta"
};

const mimeTypes: Record<RasterFormat, string> = {
  png: "image/png",
  webp: "image/webp",
  jpg: "image/jpeg"
};

const round = (value: number) => Math.round(value * 100) / 100;

const toLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

export const getReadableTextColor = (hex: string): string => {
  const [red, green, blue] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  const luminance = 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
  return luminance > 0.3 ? brand.ink : brand.white;
};

export const getSymbolColors = (context: BrandContext, palette: LogoPalette): SymbolColors => {
  if (palette === "monoWhite" || palette === "monoInk") {
    const color = palette === "monoWhite" ? brand.white : brand.ink;
    return { blades: { data: color, content: color, links: color }, handle: color, word: color, run: [color, color, color] };
  }

  const neutral = palette === "dark" ? brand.steel : brand.ink;
  const textTone = (tool: BrandTool) => (palette === "dark" ? brand.tools[tool].base : brand.tools[tool].logoOnLight);

  if (context === "general") {
    return {
      blades: { data: brand.tools.data.base, content: brand.tools.content.base, links: brand.tools.links.base },
      handle: neutral,
      word: neutral,
      run: [textTone("data"), textTone("content"), textTone("links")]
    };
  }

  const base = brand.tools[context].base;
  const tone = textTone(context);
  return { blades: { data: base, content: base, links: base }, handle: neutral, word: neutral, run: [tone, tone, tone] };
};

export const buildSymbolMarkup = (colors: SymbolColors, variant: SymbolVariant, id: string): string => {
  const thickness = symbolBladeThickness[variant];
  const blades = symbolBlades
    .map(
      ({ tool, angle, length }) =>
        `<g transform="translate(${symbolPivot.x} ${symbolPivot.y}) rotate(${angle})"><rect x="0" y="${-thickness / 2}" width="${length}" height="${thickness}" rx="${thickness / 2}" fill="${colors.blades[tool]}"/></g>`
    )
    .join("");

  if (variant === "tiny") {
    return `${blades}<circle cx="${symbolPivot.x}" cy="${symbolPivot.y}" r="${symbolHandle.tinyRadius}" fill="${colors.handle}"/>`;
  }

  const height = symbolHandleHeight[variant];
  const maskId = `${id}-rivet`;
  const mask = `<defs><mask id="${maskId}"><rect x="0" y="0" width="96" height="96" fill="#fff"/><circle cx="${symbolPivot.x}" cy="${symbolPivot.y}" r="${symbolHandle.rivet}" fill="#000"/></mask></defs>`;
  const handle = `<rect x="${symbolHandle.x}" y="${symbolPivot.y - height / 2}" width="${symbolHandle.width}" height="${height}" rx="${height / 2}" fill="${colors.handle}"/>`;
  return `${mask}<g mask="url(#${maskId})">${blades}${handle}</g>`;
};

const symbolWidthFor = (height: number) => (symbolViewBox.width * height) / symbolViewBox.height;

const placeSymbol = (colors: SymbolColors, variant: SymbolVariant, id: string, height: number, x: number, y: number) => {
  const scale = height / symbolViewBox.height;
  return `<g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)}) translate(${-symbolViewBox.x} ${-symbolViewBox.y})">${buildSymbolMarkup(colors, variant, id)}</g>`;
};

const buildWordmarkMarkup = (colors: SymbolColors, x: number, y: number, anchor: "start" | "middle") =>
  `<text x="${round(x)}" y="${round(y)}" text-anchor="${anchor}" font-family="Unbounded, sans-serif" font-weight="800" font-size="${brandWordmark.fontSize}" letter-spacing="${brandWordmark.letterSpacing}" fill="${colors.word}">POCKET<tspan fill="${colors.run[0]}">R</tspan><tspan fill="${colors.run[1]}">U</tspan><tspan fill="${colors.run[2]}">N</tspan></text>`;

const buildAppIconMarkup = (colors: SymbolColors, palette: LogoPalette, variant: SymbolVariant, id: string, size: number) => {
  const symbolHeight = size * 0.5;
  const symbolWidth = symbolWidthFor(symbolHeight);
  return `<rect width="${size}" height="${size}" rx="${round(size * 0.225)}" fill="${appIconBackgrounds[palette]}"/>${placeSymbol(colors, variant, id, symbolHeight, (size - symbolWidth) / 2, (size - symbolHeight) / 2)}`;
};

const buildContent = (config: LogoConfig, wordWidth: number, id: string) => {
  const colors = getSymbolColors(config.context, config.palette);
  const { capHeight } = brandWordmark;

  if (config.kind === "symbol") {
    const height = 240;
    return { width: symbolWidthFor(height), height, markup: placeSymbol(colors, "full", id, height, 0, 0) };
  }

  if (config.kind === "wordmark") {
    return { width: wordWidth, height: capHeight + 8, markup: buildWordmarkMarkup(colors, 0, capHeight + 4, "start") };
  }

  if (config.kind === "appIcon") {
    return { width: 512, height: 512, markup: buildAppIconMarkup(colors, config.palette, "bold", id, 512) };
  }

  if (config.kind === "stacked") {
    const symbolHeight = 180;
    const symbolWidth = symbolWidthFor(symbolHeight);
    const width = Math.max(symbolWidth, wordWidth);
    const baseline = symbolHeight + 44 + capHeight;
    return {
      width,
      height: baseline + 4,
      markup: `${placeSymbol(colors, "full", id, symbolHeight, (width - symbolWidth) / 2, 0)}${buildWordmarkMarkup(colors, width / 2, baseline, "middle")}`
    };
  }

  const symbolHeight = 128;
  const symbolWidth = symbolWidthFor(symbolHeight);
  const gap = 36;
  return {
    width: symbolWidth + gap + wordWidth,
    height: symbolHeight,
    markup: `${placeSymbol(colors, "full", id, symbolHeight, 0, 0)}${buildWordmarkMarkup(colors, symbolWidth + gap, (symbolHeight + capHeight) / 2, "start")}`
  };
};

const wrapSvg = (width: number, height: number, body: string, fontCss: string) => {
  const style = fontCss ? `<style>${fontCss}</style>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}" height="${round(height)}" viewBox="0 0 ${round(width)} ${round(height)}">${style}${body}</svg>`;
};

export const buildLogoSvg = (config: LogoConfig, wordWidth: number, fontCss = "", id = "pocketrun"): BuiltSvg => {
  const content = buildContent(config, wordWidth, id);
  const ratio = aspectRatios[config.aspect];
  const fillShare = 0.7;
  const width = ratio ? Math.max(content.width / fillShare, (content.height / fillShare) * ratio) : content.width;
  const height = ratio ? width / ratio : content.height;
  const background = backgroundColors[config.background];
  const backdrop = background ? `<rect width="${round(width)}" height="${round(height)}" fill="${background}"/>` : "";
  const body = `${backdrop}<g transform="translate(${round((width - content.width) / 2)} ${round((height - content.height) / 2)})">${content.markup}</g>`;
  return { svg: wrapSvg(width, height, body, fontCss), width, height };
};

export const buildFaviconSvg = (size: number, id = "pocketrun-favicon"): BuiltSvg => {
  const variant: SymbolVariant = size <= 32 ? "tiny" : size <= 64 ? "bold" : "full";
  const colors = getSymbolColors("general", "dark");
  const body = buildAppIconMarkup(colors, "dark", variant, id, 512);
  return { svg: wrapSvg(512, 512, body, ""), width: 512, height: 512 };
};

export const getRasterDimensions = (built: BuiltSvg, size: number) => {
  const scale = size / Math.max(built.width, built.height);
  return { width: Math.max(1, Math.round(built.width * scale)), height: Math.max(1, Math.round(built.height * scale)) };
};

export const getOpaqueFill = (config: LogoConfig): string =>
  backgroundColors[config.background] ??
  (config.palette === "dark" || config.palette === "monoWhite" ? brand.graphite : brand.paper);

export const rasterizeSvg = (built: BuiltSvg, size: number, format: RasterFormat, fill?: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const { width, height } = getRasterDimensions(built, size);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Canvas indisponível"));
      if (fill) {
        context.fillStyle = fill;
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem"))), mimeTypes[format], 0.92);
    };
    image.onerror = () => reject(new Error("Falha ao carregar o SVG"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(built.svg)}`;
  });

export const svgToBlob = (svg: string) => new Blob([svg], { type: "image/svg+xml;charset=utf-8" });

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const buildLogoFileName = (config: LogoConfig, extension: string, size?: number) => {
  const aspect = config.aspect === "original" ? "" : `-${config.aspect.replace(/[:.]/g, "x")}`;
  const pixels = size ? `-${size}px` : "";
  return `pocketrun-${kindSlugs[config.kind]}-${config.context}-${paletteSlugs[config.palette]}${aspect}${pixels}.${extension}`;
};

export const measureWordmarkWidth = async (): Promise<number> => {
  await document.fonts.load(brandWordmark.font, brandWordmark.text);
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return brandWordmark.fallbackWidth;
  context.font = brandWordmark.font;
  const naturalWidth = context.measureText(brandWordmark.text).width;
  return (naturalWidth + brandWordmark.text.length * brandWordmark.letterSpacing) * 1.02;
};
