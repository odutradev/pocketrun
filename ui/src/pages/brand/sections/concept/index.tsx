import { Grid, Panel, PanelText, PanelTitle, Section } from "../../styles";
import SectionHeading from "../../subcomponents/sectionHeading";
import { Paragraphs, Quote, Text } from "./styles";
import { brandPersonality } from "@assets/data";

const Concept = () => (
  <Section id="conceito">
    <SectionHeading number="01" title="O conceito" />
    <Paragraphs>
      <Text>
        Pocket é bolso; run é rodar. O PocketRun é um backend que cabe no bolso e fica rodando por você: uma instância
        só, no seu servidor, com tudo o que um projeto pessoal precisa.
      </Text>
      <Text>
        O símbolo é um canivete. O cabo é a instância e cada lâmina é uma ferramenta: Dados, Conteúdos e Links. O
        PocketDB e o Shareds, que eram dois projetos, agora saem do mesmo cabo.
      </Text>
      <Text>
        Cada ferramenta tem a sua cor. No geral, a marca mostra as três; ao abrir uma ferramenta, as lâminas e o RUN
        assumem a cor dela, e você sempre sabe onde está.
      </Text>
    </Paragraphs>
    <Quote>Uma ferramenta de bolso. Dados, conteúdos e links no mesmo cabo.</Quote>
    <Grid $columns={4}>
      {brandPersonality.map((trait) => (
        <Panel key={trait.title}>
          <PanelTitle>{trait.title}</PanelTitle>
          <PanelText>{trait.description}</PanelText>
        </Panel>
      ))}
    </Grid>
  </Section>
);

export default Concept;
