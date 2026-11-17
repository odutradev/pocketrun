import BrandSymbol from "@components/brandSymbol";
import { getSymbolColors } from "@utils/functions/brandAssets";

import { Letter, Wordmark, Wrapper } from "./styles";
import type { BrandLogoProps } from "./types";

const runLetters = ["R", "U", "N"] as const;

const BrandLogo: React.FC<BrandLogoProps> = ({ size, layout = "horizontal", context = "general", palette = "dark" }) => {
  const colors = getSymbolColors(context, palette);
  const symbolSize = layout === "stacked" ? size * 1.8 : size * 1.28;

  return (
    <Wrapper $layout={layout} $size={size} role="img" aria-label="PocketRun">
      {layout !== "wordmark" && <BrandSymbol size={symbolSize} context={context} palette={palette} />}
      <Wordmark $size={size} $color={colors.word} aria-hidden>
        POCKET
        {runLetters.map((letter, index) => (
          <Letter key={letter} $color={colors.run[index]}>
            {letter}
          </Letter>
        ))}
      </Wordmark>
    </Wrapper>
  );
};

export default BrandLogo;
