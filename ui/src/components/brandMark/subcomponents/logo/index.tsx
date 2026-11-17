import { useTheme } from "styled-components";

import { getSymbolColors } from "@utils/functions/brandAssets";
import { Letter, Wordmark, Wrapper } from "./styles";
import BrandSymbol from "../symbol";

import type { BrandTool } from "@utils/types/brand";
import type { BrandLogoProps } from "./types";

const pocketLetters = ["P", "O", "C", "K", "E", "T"] as const;

const runLetters = ["R", "U", "N"] as const;

const runBladeOrder: BrandTool[] = ["data", "content", "links"];

const BrandLogo = ({
  size,
  layout = "horizontal",
  context = "general",
  palette = "dark",
  motion = "none",
  ...symbolProps
}: BrandLogoProps) => {
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
