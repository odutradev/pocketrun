import { Container, Description, Headline, Pitch, Tools } from "./styles";
import BrandMark from "@components/brandMark";
import { brandTools } from "@assets/data";
import Badge from "@components/badge";

const AuthHero = () => (
  <Container aria-label="PocketRun">
    <BrandMark kind="horizontal" size={19} />
    <Pitch>
      <BrandMark kind="symbol" size={160} motion="intro" />
      <Headline>Pare de reinventar backends. Comece a construir produtos.</Headline>
      <Description>
        Uma instância, muitos projetos. Cada aplicação ganha seus dados, seus tokens e suas origens permitidas, isolados
        das outras.
      </Description>
    </Pitch>
    <Tools aria-label="Ferramentas">
      {brandTools.map((tool) => (
        <li key={tool.tool}>
          <Badge tone={tool.status === "live" ? "success" : "neutral"} hasDot>
            {tool.status === "live" ? tool.name : `${tool.name} · em breve`}
          </Badge>
        </li>
      ))}
    </Tools>
  </Container>
);

export default AuthHero;
