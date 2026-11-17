import { useEffect, useState } from "react";
import { useTheme } from "styled-components";

import type { BrandContext, SymbolPose } from "@utils/types/brand";

import { HoverArea } from "./styles";
import AppIcon from "./subcomponents/appIcon";
import BrandLogo from "./subcomponents/logo";
import BrandSymbol from "./subcomponents/symbol";
import type { BrandMarkProps } from "./types";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Ponto único da identidade visual: símbolo, logos horizontal, empilhado e só texto, e ícone do app,
// em qualquer contexto, paleta e animação.
const BrandMark: React.FC<BrandMarkProps> = ({
  kind = "horizontal",
  size,
  context = "general",
  palette,
  pose = "open",
  motion,
  isStaggered,
  snapKey,
  status,
  hasContextTransition = false,
  isHoverable = false,
  ...symbolOnlyProps
}) => {
  const { motion: timing } = useTheme();
  const [targetContext, setTargetContext] = useState<BrandContext>(context);
  const [shownContext, setShownContext] = useState<BrandContext>(context);
  const [isClosing, setIsClosing] = useState(false);
  const [isSpread, setIsSpread] = useState(false);

  // Contexto novo: com a transição ligada, fecha primeiro e só troca a cor com as lâminas escondidas.
  if (context !== targetContext) {
    setTargetContext(context);
    if (hasContextTransition && !prefersReducedMotion()) {
      setIsClosing(true);
    } else {
      setShownContext(context);
    }
  }

  // A última lâmina termina de fechar em base + stagger; o canivete fica um instante fechado antes de reabrir.
  const closedHold = timing.base + timing.stagger * 2;

  useEffect(() => {
    if (!isClosing) return undefined;
    const timeout = window.setTimeout(() => {
      setShownContext(targetContext);
      setIsClosing(false);
    }, closedHold);
    return () => window.clearTimeout(timeout);
  }, [isClosing, targetContext, closedHold]);

  const resolvePose = (): SymbolPose => {
    if (isClosing) return "closed";
    if (isSpread && pose === "open") return "spread";
    return pose;
  };

  const shared = {
    size,
    context: shownContext,
    palette,
    pose: resolvePose(),
    motion,
    // O hover abre todas as lâminas juntas, como na demo da identidade visual.
    isStaggered: isSpread && !isClosing ? false : isStaggered,
    snapKey,
    status
  };

  const mark =
    kind === "symbol" ? (
      <BrandSymbol {...shared} {...symbolOnlyProps} />
    ) : kind === "appIcon" ? (
      <AppIcon {...shared} />
    ) : (
      <BrandLogo {...shared} layout={kind} />
    );

  if (!isHoverable) return mark;

  return (
    <HoverArea
      onMouseEnter={() => setIsSpread(true)}
      onMouseLeave={() => setIsSpread(false)}
      onFocus={() => setIsSpread(true)}
      onBlur={() => setIsSpread(false)}
    >
      {mark}
    </HoverArea>
  );
};

export default BrandMark;
