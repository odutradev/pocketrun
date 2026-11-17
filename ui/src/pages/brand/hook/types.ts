import type { BrandContext, BuiltSvg, FaviconItem, LogoConfig, TypeFamily } from "@utils/types/brand";

export interface UseBrandPageReturn {
  heroContext: BrandContext;
  isGuidesVisible: boolean;
  playgroundText: string;
  playgroundFamily: TypeFamily;
  playgroundWeight: number;
  generatorConfig: LogoConfig;
  generatorPreview: BuiltSvg;
  generatorDimensions: { width: number; height: number };
  generatorFileName: string;
  isAssetsReady: boolean;
  isFontEmbedded: boolean;
  isExporting: boolean;
  prepareAssets: () => Promise<void>;
  handleHeroContextChange: (context: BrandContext) => void;
  handleGuidesChange: (isVisible: boolean) => void;
  handlePlaygroundTextChange: (text: string) => void;
  handlePlaygroundFamilyChange: (family: TypeFamily) => void;
  handlePlaygroundWeightChange: (weight: number) => void;
  handleGeneratorChange: <K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) => void;
  handleDownloadSvg: (config: LogoConfig) => void;
  handleDownloadRaster: (config: LogoConfig) => void;
  handleCopySvg: (config: LogoConfig) => void;
  handleDownloadFavicon: (item: FaviconItem) => void;
  handleCopyColor: (hex: string) => void;
  isCopied: (key: string) => boolean;
}
