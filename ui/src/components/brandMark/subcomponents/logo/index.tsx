import { useTheme } from "styled-components";

import { getSymbolColors } from "@utils/functions/brandAssets";
import type { BrandTool } from "@utils/types/brand";

import BrandSymbol from "../symbol";
import { Letter, Wordmark, Wrapper } from "./styles";
import type { BrandLogoProps } from "./types";

const pocketLetters = ["P", "O", "C", "K", "E", "T"] as const;

const runLetters = ["R", "U", "N"] as const;

// R abre com Dados, U com Conteúdos e N com Links.
const runBladeOrder: BrandTool[] = ["data", "content", "links"];

const BrandLogo: React.FC<BrandLogoProps> = ({
  size,
  layout = "horizontal",
  context = "general",
  palette = "dark",
  motion = "none",
  ...symbolProps
}) => {
  const { motion: timing } = useTheme();
  const colors = getSymbolColors(context, palette);
  const symbolSize = layout === "stacked" ? size * 1.8 : size * 1.28;
  const letterStep = timing.stagger / 2;
  const runDelay = timing.base + pocketLetters.length * letterStep;

  return (
    <Wrapper $layout={layout} $size={size} role="img" aria-label="PocketRun">
      {layout !== "wordmark" && (
        <BrandSymbol
          size={symbolSize}
          context={context}
          palette={palette}
          {...symbolProps}
          motion={motion}
          motionDelay={runDelay}
          bladeOrder={runBladeOrder}
        />
      )}
      <Wordmark $size={size} $color={colors.word} aria-hidden>
        {/* Letras separadas só quando animam, para não mexer no kerning do logo estático. */}
        {motion !== "intro"
          ? pocketLetters.join("")
          : pocketLetters.map((letter, index) => (
              <Letter key={letter} $motion={motion} $delay={index * letterStep} $isRun={false}>
                {letter}
              </Letter>
            ))}
        {runLetters.map((letter, index) => (
          <Letter
            key={letter}
            $color={colors.run[index]}
            $motion={motion}
            $delay={runDelay + index * timing.stagger}
            $isRun
          >
            {letter}
          </Letter>
        ))}
      </Wordmark>
    </Wrapper>
  );
};

export default BrandLogo;
