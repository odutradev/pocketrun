import { create } from "zustand";

import { measureWordmarkWidth } from "@utils/functions/brandAssets";
import { brandFontTimeout, brandWordmark } from "@assets/config";
import { createLocalLogger } from "@utils/functions";
import { getEmbeddedFontCss } from "@actions/brand";
import { defaultLogoConfig } from "@assets/data";

import type { BrandStore } from "./types";

const logger = createLocalLogger("brandPage");

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
