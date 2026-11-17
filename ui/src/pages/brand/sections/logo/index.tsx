import { brandContextOptions, logoKindOptions } from "@assets/data";
import BrandLogo from "@components/brandLogo";
import BrandSymbol from "@components/brandSymbol";
import type { LogoKind, LogoPalette } from "@utils/types/brand";

import SectionHeading from "../../subcomponents/sectionHeading";
import { Grid, Label, Lead, Panel, PanelText, PanelTitle, Section, Stage } from "../../styles";
import { ContextPanel, Stages } from "./styles";

const versionKinds: LogoKind[] = ["horizontal", "stacked", "symbol", "wordmark"];

const renderVersion = (kind: LogoKind, palette: LogoPalette) => {
  if (kind === "symbol") return <BrandSymbol size={64} palette={palette} />;
  if (kind === "stacked") return <BrandLogo size={18} layout="stacked" palette={palette} />;
  if (kind === "wordmark") return <BrandLogo size={22} layout="wordmark" palette={palette} />;
  return <BrandLogo size={18} palette={palette} />;
};

const LogoSection: React.FC = () => (
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
              <Stage $tone="dark">{renderVersion(kind, "dark")}</Stage>
              <Stage $tone="light">{renderVersion(kind, "light")}</Stage>
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
            <BrandLogo size={14} context={option.value} />
          </Stage>
          <PanelTitle>{option.label}</PanelTitle>
          <PanelText>{option.description}</PanelText>
        </ContextPanel>
      ))}
    </Grid>
  </Section>
);

export default LogoSection;
