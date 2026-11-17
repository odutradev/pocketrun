import { brandNeutralColors, brandStateColors, brandTokens, brandToolColors } from "@assets/data";
import { Code, Table, TableCell, TableHead, TableRow, TokenColor } from "./styles";
import { Grid, Label, Lead, Mono, Panel, PanelText, Section } from "../../styles";
import SectionHeading from "../../subcomponents/sectionHeading";
import ColorSwatch from "../../subcomponents/colorSwatch";



const radixSnippet = [
  "// painel inteiro: neutro, botões globais em aço",
  '<Theme accentColor="gray" grayColor="gray">',
  "  <Button highContrast>Nova aplicação</Button>",
  "",
  "// cada ferramenta reabre o tema com a sua cor",
  '<Theme accentColor="indigo"> Dados',
  '<Theme accentColor="amber">  Conteúdos',
  '<Theme accentColor="grass">  Links'
].join("\n");

const Colors = () => (
  <Section id="cores">
    <SectionHeading
      number="04"
      title="Cores e tokens"
      lead="Estrutura em aço e grafite; uma cor para cada ferramenta. A cor só aparece para dizer onde você está. Clique em qualquer cor para copiar o HEX."
    />
    <Label>Ferramentas</Label>
    <Grid $columns={3}>
      {brandToolColors.map((color) => (
        <ColorSwatch key={color.hex} color={color} size="large" />
      ))}
    </Grid>
    <Label>Neutros</Label>
    <Lead>Cinza puro, sem tom: qualquer tom puxaria uma das três cores e desequilibraria as outras.</Lead>
    <Grid $columns={3}>
      {brandNeutralColors.map((color) => (
        <ColorSwatch key={color.hex} color={color} size="large" />
      ))}
    </Grid>
    <Label>Estados</Label>
    <Grid $columns={3}>
      {brandStateColors.map((color) => (
        <ColorSwatch key={color.hex} color={color} size="large" />
      ))}
    </Grid>
    <Label>Tokens de tema</Label>
    <Table role="table" aria-label="Tokens de tema nos modos escuro e claro">
      <TableRow role="row">
        <TableHead role="columnheader">Token</TableHead>
        <TableHead role="columnheader">Escuro</TableHead>
        <TableHead role="columnheader">Claro</TableHead>
      </TableRow>
      {brandTokens.map((token) => (
        <TableRow key={token.token} role="row">
          <TableCell role="cell">
            <Mono>{token.token}</Mono>
          </TableCell>
          <TableCell role="cell">
            <TokenColor $color={token.dark} />
            <Mono>{token.dark}</Mono>
          </TableCell>
          <TableCell role="cell">
            <TokenColor $color={token.light} />
            <Mono>{token.light}</Mono>
          </TableCell>
        </TableRow>
      ))}
    </Table>
    <Panel>
      <PanelText>
        No código, todas as cores vêm das escalas do Radix. O painel usa o tema neutro, e cada ferramenta reabre o tema
        com a sua cor. Texto colorido usa o passo 11; o passo 9 fica para fundos, botões e ícones.
      </PanelText>
      <Code>{radixSnippet}</Code>
    </Panel>
  </Section>
);

export default Colors;
