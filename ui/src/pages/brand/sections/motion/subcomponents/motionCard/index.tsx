import { ReloadIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { Fragment, useState } from "react";

import { Panel, PanelText, PanelTitle } from "../../../../styles";
import { CardStage, ReplayButton, Specs } from "./styles";
import type { MotionCardProps } from "./types";

const MotionCard: React.FC<MotionCardProps> = ({ demo, children }) => {
  const [playCount, setPlayCount] = useState(0);

  return (
    <Panel>
      <CardStage $tone="dark">
        {/* Trocar a key remonta a demo e toca a animação de novo. */}
        <Fragment key={playCount}>{children}</Fragment>
        {demo.hasReplay && (
          <ReplayButton>
            <IconButton
              variant="soft"
              color="gray"
              highContrast
              aria-label={`Repetir a animação ${demo.title}`}
              onClick={() => setPlayCount((count) => count + 1)}
            >
              <ReloadIcon />
            </IconButton>
          </ReplayButton>
        )}
      </CardStage>
      <PanelTitle>{demo.title}</PanelTitle>
      <PanelText>{demo.description}</PanelText>
      <Specs>
        <dt>Onde usar</dt>
        <dd>{demo.usage}</dd>
        <dt>Duração</dt>
        <dd>{demo.timing}</dd>
        <dt>Curva</dt>
        <dd>{demo.easing}</dd>
      </Specs>
    </Panel>
  );
};

export default MotionCard;
