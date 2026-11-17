import { brandContextOptions, logoKindOptions } from "@assets/data";
import BrandMark from "@components/brandMark";
import type { LogoKind } from "@utils/types/brand";

import SectionHeading from "../../subcomponents/sectionHeading";
import { Grid, Label, Lead, Panel, PanelText, PanelTitle, Section, Stage } from "../../styles";
import { ContextPanel, Stages } from "./styles";

const versionKinds: LogoKind[] = ["horizontal", "stacked", "symbol", "wordmark"];

// Tamanho de cada versão para que todas ocupem o palco de forma parecida.
const versionSizes: Record<LogoKind, number> = { horizontal: 18, stacked: 18, symbol: 64, wordmark: 22, appIcon: 96 };

const LogoSection = () => (
  <Section id="logotipo">
    <SectionHeading
      number="03"
      title="O logotipo e as versões"
      lead="Unbounded 800 em caixa alta, com tracking de −3,5%. POCKET em aço ou tinta; no geral, o RUN usa as três cores, letra por letra, na ordem das lâminas."
    />
    <Grid $columns={2}>
      {versionKinds.map((kind) => {
        const option = logoKindOptions.find((item) => item.value === kind);
        return (
          <Panel key={kind}>
            <PanelTitle>{option?.label}</PanelTitle>
            <PanelText>{option?.description}</PanelText>
            <Stages>
              <Stage $tone="dark"><BrandMark kind={kind} size={versionSizes[kind]} palette="dark" /></Stage>
              <Stage $tone="light"><BrandMark kind={kind} size={versionSizes[kind]} palette="light" /></Stage>
            </Stages>
          </Panel>
        );
      })}
    </Grid>
    <Label>Marca por contexto</Label>
    <Lead>
      Fora das ferramentas, a marca mostra as três cores. Ao entrar numa ferramenta, as três lâminas e o RUN assumem a
      cor dela, e o cabo continua aço.
    </Lead>
    <Grid $columns={4}>
      {brandContextOptions.map((option) => (
        <ContextPanel key={option.value} $context={option.value}>
          <Stage $tone="dark">
            <BrandMark size={14} context={option.value} />
          </Stage>
          <PanelTitle>{option.label}</PanelTitle>
          <PanelText>{option.description}</PanelText>
        </ContextPanel>
      ))}
    </Grid>
  </Section>
);

export default LogoSection;
