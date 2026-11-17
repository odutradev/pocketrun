import { brandTools } from "@assets/data";
import BrandMark from "@components/brandMark";

import SectionHeading from "../../subcomponents/sectionHeading";
import { Grid, Label, Mono, Panel, PanelText, PanelTitle, Section, Stage } from "../../styles";
import { Route, Status, ToolHeader, ToolPanel, Writing } from "./styles";

const ToolsSection = () => (
  <Section id="ferramentas">
    <SectionHeading
      number="07"
      title="Uma instância, três ferramentas"
      lead="Todas as ferramentas usam o mesmo símbolo e o mesmo nome. O que muda é a cor das lâminas e do RUN, que diz em qual ferramenta você está."
    />
    <Grid $columns={3}>
      {brandTools.map((tool) => (
        <ToolPanel key={tool.tool} $tool={tool.tool}>
          <Stage $tone="dark">
            <BrandMark size={14} context={tool.tool} />
          </Stage>
          <ToolHeader>
            <PanelTitle>{tool.name}</PanelTitle>
            <Status $isLive={tool.status === "live"}>{tool.status === "live" ? "No ar" : "Planejado"}</Status>
          </ToolHeader>
          <Route $tool={tool.tool}>{tool.route}</Route>
          <PanelText>{tool.description}</PanelText>
          <PanelText>
            {tool.colorName} · {tool.origin}
          </PanelText>
        </ToolPanel>
      ))}
    </Grid>
    <Label>Como escrever</Label>
    <Grid $columns={3}>
      <Panel>
        <Writing>PocketRun Dados</Writing>
        <PanelText>Em texto corrido: o nome da marca e depois o da ferramenta, com espaço.</PanelText>
      </Panel>
      <Panel>
        <Stage $tone="dark">
          <BrandMark size={14} context="content" />
        </Stage>
        <PanelText>No logo: a marca inteira na cor da ferramenta, sem escrever o nome dela.</PanelText>
      </Panel>
      <Panel>
        <Writing>
          <Mono>/kv/tasks</Mono>
        </Writing>
        <PanelText>No código e na API: cada ferramenta é uma rota, em caixa baixa.</PanelText>
      </Panel>
    </Grid>
  </Section>
);

export default ToolsSection;
