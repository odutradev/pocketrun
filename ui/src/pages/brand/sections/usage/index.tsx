import { Cross2Icon } from "@radix-ui/react-icons";

import { brandDonts, brandUsageRules } from "@assets/data";
import BrandLogo from "@components/brandLogo";

import SectionHeading from "../../subcomponents/sectionHeading";
import { Grid, Panel, PanelText, PanelTitle, Section } from "../../styles";
import { Dont, DontIcon, Protection, ProtectionArea, ProtectionStage } from "./styles";

const UsageSection: React.FC = () => (
  <Section id="usos">
    <SectionHeading
      number="08"
      title="Usos corretos e incorretos"
      lead="Regras curtas para a marca chegar inteira em qualquer lugar: área de proteção, tamanho mínimo, contexto e escrita."
    />
    <Grid $columns={2}>
      {brandUsageRules.map((rule) => (
        <Panel key={rule.title}>
          <PanelTitle>{rule.title}</PanelTitle>
          <PanelText>{rule.description}</PanelText>
        </Panel>
      ))}
    </Grid>
    <Protection>
      <ProtectionStage>
        <ProtectionArea>
          <BrandLogo size={20} />
        </ProtectionArea>
      </ProtectionStage>
      <PanelText>Área de proteção = altura do cabo do símbolo, nos quatro lados.</PanelText>
    </Protection>
    <Grid $columns={3}>
      {brandDonts.map((dont) => (
        <Dont key={dont}>
          <DontIcon>
            <Cross2Icon />
          </DontIcon>
          <PanelText>{dont}</PanelText>
        </Dont>
      ))}
    </Grid>
  </Section>
);

export default UsageSection;
