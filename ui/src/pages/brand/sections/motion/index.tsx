import type { ReactNode } from "react";

import { brandMotionDemos, brandMotionTokens } from "@assets/data";
import BrandMark from "@components/brandMark";
import type { MotionDemoId } from "@utils/types/brand";

import SectionHeading from "../../subcomponents/sectionHeading";
import { Grid, Label, Panel, PanelText, Section } from "../../styles";
import { TokenName, TokenRow, TokenValue } from "./styles";
import ContextDemo from "./subcomponents/contextDemo";
import HoverDemo from "./subcomponents/hoverDemo";
import MotionCard from "./subcomponents/motionCard";
import SnapDemo from "./subcomponents/snapDemo";
import StatusDemo from "./subcomponents/statusDemo";

const demoContent: Record<MotionDemoId, ReactNode> = {
  intro: <BrandMark kind="symbol" size={120} motion="intro" motionDelay={200} />,
  wordmark: <BrandMark size={26} motion="intro" />,
  loader: <BrandMark kind="symbol" size={90} motion="loop" />,
  hover: <HoverDemo />,
  context: <ContextDemo />,
  status: <StatusDemo />,
  snap: <SnapDemo />,
  appIcon: <BrandMark kind="appIcon" size={120} motion="intro" />
};

const MotionSection: React.FC = () => (
  <Section id="movimento">
    <SectionHeading
      number="09"
      title="Movimento"
      lead="Todo movimento da marca nasce do canivete: abrir, fechar ou travar uma lâmina. Nada gira à toa, nada pisca sem motivo."
    />
    <Grid $columns={2}>
      {brandMotionDemos.map((demo) => (
        <MotionCard key={demo.id} demo={demo}>
          {demoContent[demo.id]}
        </MotionCard>
      ))}
    </Grid>
    <Label>Tokens de movimento</Label>
    <Panel $padded={false}>
      {brandMotionTokens.map((item) => (
        <TokenRow key={item.token}>
          <TokenName>{item.token}</TokenName>
          <TokenValue>{item.value}</TokenValue>
          <PanelText>{item.usage}</PanelText>
        </TokenRow>
      ))}
    </Panel>
    <PanelText>
      Com o movimento reduzido ligado no sistema, as lâminas aparecem direto na posição final e só as trocas de cor
      continuam.
    </PanelText>
  </Section>
);

export default MotionSection;
