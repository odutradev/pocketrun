import { DownloadIcon } from "@radix-ui/react-icons";

import { Grid, Label, Lead, Mono, Panel, PanelText, PanelTitle, Section } from "../../styles";
import { FileInfo, FileRow, IconStage, SizeItem, Sizes } from "./styles";
import { brandFaviconPack, brandIconPalettes } from "@assets/data";
import SectionHeading from "../../subcomponents/sectionHeading";
import BrandMark from "@components/brandMark";
import Button from "@components/button";
import useBrandPage from "../../hook";



const realSizes = [16, 32, 48, 64, 128];

const IconSection = () => {
  const { handleDownloadFavicon, isExporting } = useBrandPage();

  return (
    <Section id="icone">
      <SectionHeading
        number="06"
        title="Ícone do app e favicon"
        lead="O símbolo dentro de um bloco com cantos de 22,5%. Três desenhos para três faixas de tamanho: em 16 px o cabo vira um círculo."
      />
      <Grid $columns={3}>
        {brandIconPalettes.map((item) => (
          <Panel key={item.palette}>
            <IconStage>
              <BrandMark kind="appIcon" size={112} palette={item.palette} />
            </IconStage>
            <PanelTitle>{item.name}</PanelTitle>
            <PanelText>{item.description}</PanelText>
          </Panel>
        ))}
      </Grid>
      <Label>Em tamanho real</Label>
      <Panel>
        <Sizes>
          {realSizes.map((size) => (
            <SizeItem key={size}>
              <BrandMark kind="appIcon" size={size} />
              <Mono>{size} px</Mono>
            </SizeItem>
          ))}
        </Sizes>
      </Panel>
      <Label>Pacote de favicons</Label>
      <Lead>Os arquivos para a pasta pública de qualquer projeto. Gerados aqui mesmo, no seu navegador.</Lead>
      <Panel $padded={false}>
        {brandFaviconPack.map((item) => (
          <FileRow key={item.fileName}>
            <FileInfo>
              <Mono>{item.fileName}</Mono>
              <PanelText>
                {item.format === "svg" ? "Vetorial" : `${item.size} px`} · {item.usage}
              </PanelText>
            </FileInfo>
            <Button
              variant="secondary"
              leftIcon={<DownloadIcon />}
              disabled={isExporting}
              onClick={() => handleDownloadFavicon(item)}
            >
              Baixar
            </Button>
          </FileRow>
        ))}
      </Panel>
    </Section>
  );
};

export default IconSection;
