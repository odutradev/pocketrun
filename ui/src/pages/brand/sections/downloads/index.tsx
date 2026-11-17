import { CheckIcon, CopyIcon, DownloadIcon } from "@radix-ui/react-icons";

import {
  brandContextOptions,
  brandQuickKit,
  logoAspectOptions,
  logoBackgroundOptions,
  logoKindOptions,
  logoPaletteOptions,
  rasterFormatOptions,
  rasterSizeOptions
} from "@assets/data";
import Button from "@components/button";

import useBrandPage from "../../hook";
import OptionSelect from "../../subcomponents/optionSelect";
import SectionHeading from "../../subcomponents/sectionHeading";
import { Grid, Label, Mono, Panel, PanelText, PanelTitle, Section } from "../../styles";
import { Actions, Controls, Generator, Hint, Preview, PreviewMeta, PreviewStage } from "./styles";

const DownloadsSection = () => {
  const {
    generatorConfig,
    generatorPreview,
    generatorDimensions,
    generatorFileName,
    isAssetsReady,
    isFontEmbedded,
    isExporting,
    handleGeneratorChange,
    handleDownloadSvg,
    handleDownloadRaster,
    handleCopySvg,
    isCopied
  } = useBrandPage();

  const kindDescription = logoKindOptions.find((option) => option.value === generatorConfig.kind)?.description;
  const paletteDescription = logoPaletteOptions.find((option) => option.value === generatorConfig.palette)?.description;
  const formatLabel = generatorConfig.format.toUpperCase();
  const hasText = generatorConfig.kind !== "symbol" && generatorConfig.kind !== "appIcon";

  return (
    <Section id="downloads">
      <SectionHeading
        number="10"
        title="Central de downloads"
        lead="Monte qualquer versão da marca: tipo, contexto, cores, fundo, proporção, tamanho e formato. Os SVGs levam a fonte embutida e funcionam sem ela instalada."
      />
      <Generator>
        <Controls>
          <OptionSelect
            label="Tipo de logo"
            value={generatorConfig.kind}
            options={logoKindOptions}
            onChange={(value) => handleGeneratorChange("kind", value)}
          />
          <PanelText>{kindDescription}</PanelText>
          <OptionSelect
            label="Contexto"
            value={generatorConfig.context}
            options={brandContextOptions}
            onChange={(value) => handleGeneratorChange("context", value)}
          />
          <OptionSelect
            label="Paleta de cores"
            value={generatorConfig.palette}
            options={logoPaletteOptions}
            onChange={(value) => handleGeneratorChange("palette", value)}
          />
          <PanelText>{paletteDescription}</PanelText>
          <OptionSelect
            label="Fundo"
            value={generatorConfig.background}
            options={logoBackgroundOptions}
            onChange={(value) => handleGeneratorChange("background", value)}
          />
          <OptionSelect
            label="Proporção"
            value={generatorConfig.aspect}
            options={logoAspectOptions}
            onChange={(value) => handleGeneratorChange("aspect", value)}
          />
          <OptionSelect
            label="Tamanho da imagem"
            value={generatorConfig.size}
            options={rasterSizeOptions}
            onChange={(value) => handleGeneratorChange("size", value)}
          />
          <OptionSelect
            label="Formato da imagem"
            value={generatorConfig.format}
            options={rasterFormatOptions}
            onChange={(value) => handleGeneratorChange("format", value)}
          />
        </Controls>
        <Preview>
          <PreviewStage
            $isTransparent={generatorConfig.background === "transparent"}
            role="img"
            aria-label="Prévia do arquivo"
            dangerouslySetInnerHTML={{ __html: generatorPreview.svg }}
          />
          <PreviewMeta>
            <Mono>
              {generatorDimensions.width} × {generatorDimensions.height} px
            </Mono>
            <Mono>{generatorFileName}</Mono>
          </PreviewMeta>
          {hasText && isAssetsReady && !isFontEmbedded && (
            <Hint>
              Não foi possível embutir a fonte agora. Os arquivos com o nome podem sair com outra fonte; tente de novo com
              internet.
            </Hint>
          )}
          <Actions>
            <Button leftIcon={<DownloadIcon />} onClick={() => handleDownloadSvg(generatorConfig)}>
              Baixar SVG (vetorial)
            </Button>
            <Button
              variant="secondary"
              leftIcon={<DownloadIcon />}
              isLoading={isExporting}
              disabled={!isAssetsReady}
              onClick={() => handleDownloadRaster(generatorConfig)}
            >
              Baixar {formatLabel} ({generatorConfig.size} px)
            </Button>
            <Button
              variant="ghost"
              leftIcon={isCopied("svg") ? <CheckIcon /> : <CopyIcon />}
              onClick={() => handleCopySvg(generatorConfig)}
            >
              {isCopied("svg") ? "SVG copiado" : "Copiar SVG"}
            </Button>
          </Actions>
        </Preview>
      </Generator>
      <Label>Kit rápido</Label>
      <PanelText>Os arquivos mais usados, prontos em um clique.</PanelText>
      <Grid $columns={4}>
        {brandQuickKit.map((item) => (
          <Panel key={item.id}>
            <PanelTitle>{item.title}</PanelTitle>
            <PanelText>{item.description}</PanelText>
            <Actions>
              <Button size="sm" onClick={() => handleDownloadSvg(item.config)}>
                SVG
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!isAssetsReady || isExporting}
                onClick={() => handleDownloadRaster(item.config)}
              >
                PNG ({item.config.size} px)
              </Button>
            </Actions>
          </Panel>
        ))}
      </Grid>
    </Section>
  );
};

export default DownloadsSection;
