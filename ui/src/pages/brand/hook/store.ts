import { create } from "zustand";

import { getEmbeddedFontCss } from "@actions/brand";
import { brandFontTimeout, brandWordmark } from "@assets/config";
import { defaultLogoConfig } from "@assets/data";
import { createLocalLogger } from "@utils/functions";
import { measureWordmarkWidth } from "@utils/functions/brandAssets";
import type { BrandContext, LogoConfig, TypeFamily } from "@utils/types/brand";

const logger = createLocalLogger("brandPage");

interface BrandStore {
  heroContext: BrandContext;
  isGuidesVisible: boolean;
  playgroundText: string;
  playgroundFamily: TypeFamily;
  playgroundWeight: number;
  generatorConfig: LogoConfig;
  wordWidth: number;
  fontCss: string;
  isAssetsReady: boolean;
  setHeroContext: (context: BrandContext) => void;
  setGuidesVisible: (isVisible: boolean) => void;
  setPlaygroundText: (text: string) => void;
  setPlaygroundFamily: (family: TypeFamily) => void;
  setPlaygroundWeight: (weight: number) => void;
  updateGeneratorConfig: (patch: Partial<LogoConfig>) => void;
  prepareAssets: () => Promise<void>;
}

const useBrandStore = create<BrandStore>()((set, get) => ({
  heroContext: "general",
  isGuidesVisible: false,
  playgroundText: "Uma ferramenta de bolso. Dados, conteúdos e links no mesmo cabo.",
  playgroundFamily: "display",
  playgroundWeight: 800,
  generatorConfig: defaultLogoConfig,
  wordWidth: brandWordmark.fallbackWidth,
  fontCss: "",
  isAssetsReady: false,
  setHeroContext: (heroContext) => set({ heroContext }),
  setGuidesVisible: (isGuidesVisible) => set({ isGuidesVisible }),
  setPlaygroundText: (playgroundText) => set({ playgroundText }),
  setPlaygroundFamily: (playgroundFamily) => set({ playgroundFamily }),
  setPlaygroundWeight: (playgroundWeight) => set({ playgroundWeight }),
  updateGeneratorConfig: (patch) => set({ generatorConfig: { ...get().generatorConfig, ...patch } }),
  prepareAssets: async () => {
    if (get().isAssetsReady) return;
    const [wordWidth, fontCss] = await Promise.all([
      measureWordmarkWidth().catch((error: unknown) => {
        logger.warn(error);
        return brandWordmark.fallbackWidth;
      }),
      getEmbeddedFontCss(AbortSignal.timeout(brandFontTimeout)).catch((error: unknown) => {
        logger.warn(error);
        return "";
      })
    ]);
    set({ wordWidth, fontCss, isAssetsReady: true });
  }
}));

export default useBrandStore;
