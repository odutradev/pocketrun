import { useState } from "react";

import BrandMark from "@components/brandMark";

import { Demo, Hint } from "../../styles";
import { Target } from "./styles";

const HoverDemo: React.FC = () => {
  const [isSpread, setIsSpread] = useState(false);

  return (
    <Demo>
      <Target
        tabIndex={0}
        role="group"
        aria-label="Símbolo interativo: passe o mouse ou foque para abrir as lâminas"
        onMouseEnter={() => setIsSpread(true)}
        onMouseLeave={() => setIsSpread(false)}
        onFocus={() => setIsSpread(true)}
        onBlur={() => setIsSpread(false)}
      >
        <BrandMark kind="symbol" size={100} pose={isSpread ? "spread" : "open"} isStaggered={false} />
      </Target>
      <Hint>Passe o mouse no símbolo</Hint>
    </Demo>
  );
};

export default HoverDemo;
