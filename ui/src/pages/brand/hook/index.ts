import { useCallback, useMemo } from "react";

import useAction from "@hooks/useAction";
import useClipboard from "@hooks/useClipboard";
import {
  buildFaviconSvg,
  buildLogoFileName,
  buildLogoSvg,
  downloadBlob,
  getOpaqueFill,
  getRasterDimensions,
  rasterizeSvg,
  svgToBlob
} from "@utils/functions/brandAssets";
import type { FaviconItem, LogoConfig } from "@utils/types/brand";

import useBrandStore from "./store";
import type { UseBrandPageReturn } from "./types";

const rasterToastMessages = {
  pending: "Gerando a imagem...",
  success: "Imagem baixada",
  error: "Não foi possível gerar a imagem"
};

const faviconToastMessages = {
  pending: "Gerando o favicon...",
  success: "Favicon baixado",
  error: "Não foi possível gerar o favicon"
};

const useBrandPage = (): UseBrandPageReturn => {
  const {
    heroContext,
    isGuidesVisible,
    playgroundText,
    playgroundFamily,
    playgroundWeight,
    generatorConfig,
    wordWidth,
    fontCss,
    isAssetsReady,
    prepareAssets,
    setHeroContext,
    setGuidesVisible,
    setPlaygroundText,
    setPlaygroundFamily,
    setPlaygroundWeight,
    updateGeneratorConfig
  } = useBrandStore();
  const { copy, isCopied } = useClipboard();

  const buildExport = useCallback(
    (config: LogoConfig) => buildLogoSvg(config, wordWidth, fontCss, "pocketrun-export"),
    [wordWidth, fontCss]
  );

  const rasterAction = useAction({
    action: async (config: LogoConfig) => {
      const fill = config.format === "jpg" ? getOpaqueFill(config) : undefined;
      const blob = await rasterizeSvg(buildExport(config), config.size, config.format, fill);
      downloadBlob(blob, buildLogoFileName(config, config.format, config.size));
    },
    toastMessages: rasterToastMessages
  });

  const faviconAction = useAction({
    action: async (item: FaviconItem) => {
      const built = buildFaviconSvg(item.size);
      if (item.format === "svg") return downloadBlob(svgToBlob(built.svg), item.fileName);
      downloadBlob(await rasterizeSvg(built, item.size, "png"), item.fileName);
    },
    toastMessages: faviconToastMessages
  });

  const generatorPreview = useMemo(
    () => buildLogoSvg(generatorConfig, wordWidth, "", "pocketrun-preview"),
    [generatorConfig, wordWidth]
  );

  const handleGeneratorChange = useCallback(
    <K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) =>
      updateGeneratorConfig({ [key]: value } as Pick<LogoConfig, K>),
    [updateGeneratorConfig]
  );

  return {
    heroContext,
    isGuidesVisible,
    playgroundText,
    playgroundFamily,
    playgroundWeight,
    generatorConfig,
    generatorPreview,
    generatorDimensions: getRasterDimensions(generatorPreview, generatorConfig.size),
    generatorFileName: buildLogoFileName(generatorConfig, generatorConfig.format, generatorConfig.size),
    isAssetsReady,
    isFontEmbedded: fontCss.length > 0,
    isExporting: rasterAction.isPending || faviconAction.isPending,
    prepareAssets,
    handleHeroContextChange: setHeroContext,
    handleGuidesChange: setGuidesVisible,
    handlePlaygroundTextChange: setPlaygroundText,
    handlePlaygroundFamilyChange: setPlaygroundFamily,
    handlePlaygroundWeightChange: setPlaygroundWeight,
    handleGeneratorChange,
    handleDownloadSvg: (config) => downloadBlob(svgToBlob(buildExport(config).svg), buildLogoFileName(config, "svg")),
    handleDownloadRaster: (config) => {
      rasterAction.execute(config);
    },
    handleCopySvg: (config) => {
      copy(buildExport(config).svg, "svg");
    },
    handleDownloadFavicon: (item) => {
      faviconAction.execute(item);
    },
    handleCopyColor: (hex) => {
      copy(hex, hex);
    },
    isCopied
  };
};

export default useBrandPage;
