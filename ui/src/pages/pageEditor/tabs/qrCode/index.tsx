import { DownloadIcon } from "@radix-ui/react-icons";
import { useTheme } from "styled-components";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { Container, Downloads, Field, FieldLabel, Hint, Panel, PanelTitle, Preview } from "./styles";
import { qrLevelOptions, qrMarginOptions, qrSizeOptions } from "@assets/data";
import { createLocalLogger, publicLinkUrl } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import SwitchField from "@components/switchField";
import CopyField from "@components/copyField";
import usePageEditorPage from "../../hook";
import Button from "@components/button";

import type { QRCodeToStringOptions } from "qrcode";
import type { QrOptions } from "./types";

const logger = createLocalLogger("pageQrCode");

const saveFile = (fileName: string, href: string) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
};

const QrCodeTab = () => {
  const { brand } = useTheme();
  const { sitePage } = usePageEditorPage();
  const [options, setOptions] = useState<QrOptions>({ size: "1024", level: "M", margin: "4", isTransparent: false });
  const [svg, setSvg] = useState("");
  const url = sitePage ? publicLinkUrl(sitePage.slug) : "";
  const darkColor = brand.graphite;
  const lightColor = options.isTransparent ? "#0000" : brand.white;
  const colors = { dark: darkColor, light: lightColor };
  const qrOptions: QRCodeToStringOptions = {
    type: "svg",
    errorCorrectionLevel: options.level,
    margin: Number(options.margin),
    color: colors
  };

  useEffect(() => {
    if (!url) return;
    const request = { isCurrent: true };
    const color = { dark: darkColor, light: lightColor };
    QRCode.toString(url, { type: "svg", errorCorrectionLevel: options.level, margin: Number(options.margin), color })
      .then((markup) => {
        if (request.isCurrent) setSvg(markup);
      })
      .catch((error: unknown) => logger.error(error));
    return () => {
      request.isCurrent = false;
    };
  }, [url, options.level, options.margin, darkColor, lightColor]);

  if (!sitePage) return null;

  const fileName = `qrcode-${sitePage.slug}`;

  const handleDownloadPng = async () => {
    const dataUrl = await QRCode.toDataURL(url, {
      width: Number(options.size),
      errorCorrectionLevel: options.level,
      margin: Number(options.margin),
      color: colors
    });
    saveFile(`${fileName}.png`, dataUrl);
  };

  const handleDownloadSvg = async () => {
    const markup = await QRCode.toString(url, qrOptions);
    const href = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
    saveFile(`${fileName}.svg`, href);
    URL.revokeObjectURL(href);
  };

  const updateOptions = (next: Partial<QrOptions>) => setOptions((current) => ({ ...current, ...next }));

  return (
    <Container>
      <Panel>
        <PanelTitle>Prévia</PanelTitle>
        <Preview $isTransparent={options.isTransparent}>
          {svg && <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={`QR code que abre ${url}`} />}
        </Preview>
        <CopyField label="Endereço do QR code" value={url} />
        <Hint>O código abre a página, então os acessos entram na análise. Se você mudar o slug, baixe um código novo.</Hint>
      </Panel>
      <Panel>
        <PanelTitle>Opções</PanelTitle>
        <Field>
          <FieldLabel>Tamanho do PNG</FieldLabel>
          <SegmentedControl
            label="Tamanho do PNG"
            options={qrSizeOptions}
            value={options.size}
            onValueChange={(size) => updateOptions({ size })}
            isFullWidth
            mobileColumns={2}
          />
        </Field>
        <Field>
          <FieldLabel>Correção de erros</FieldLabel>
          <SegmentedControl
            label="Correção de erros"
            options={qrLevelOptions}
            value={options.level}
            onValueChange={(level) => updateOptions({ level })}
            isFullWidth
            mobileColumns={2}
          />
          <Hint>Uma correção maior deixa o código legível mesmo riscado ou com um logo por cima, mas com mais pontos.</Hint>
        </Field>
        <Field>
          <FieldLabel>Margem</FieldLabel>
          <SegmentedControl
            label="Margem"
            options={qrMarginOptions}
            value={options.margin}
            onValueChange={(margin) => updateOptions({ margin })}
            isFullWidth
          />
        </Field>
        <SwitchField
          label="Fundo transparente"
          description="Para colocar o código sobre uma arte. Use um fundo claro para os leitores reconhecerem."
          isChecked={options.isTransparent}
          onCheckedChange={(isTransparent) => updateOptions({ isTransparent })}
        />
        <Downloads>
          <Button leftIcon={<DownloadIcon />} onClick={handleDownloadPng}>
            Baixar PNG
          </Button>
          <Button variant="secondary" leftIcon={<DownloadIcon />} onClick={handleDownloadSvg}>
            Baixar SVG
          </Button>
        </Downloads>
      </Panel>
    </Container>
  );
};

export default QrCodeTab;
