import { useTheme } from "styled-components";
import { useEffect, useState } from "react";

import { prefersReducedMotion } from "@utils/functions";
import BrandSymbol from "./subcomponents/symbol";
import AppIcon from "./subcomponents/appIcon";
import BrandLogo from "./subcomponents/logo";
import { HoverArea } from "./styles";

import type { BrandContext, SymbolPose } from "@utils/types/brand";
import type { BrandMarkProps } from "./types";

const BrandMark = ({
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
}: BrandMarkProps) => {
  const { motion: timing } = useTheme();
  const [targetContext, setTargetContext] = useState<BrandContext>(context);
  const [shownContext, setShownContext] = useState<BrandContext>(context);
  const [isClosing, setIsClosing] = useState(false);
  const [isSpread, setIsSpread] = useState(false);

  if (context !== targetContext) {
    setTargetContext(context);
    if (hasContextTransition && !prefersReducedMotion()) {
      setIsClosing(true);
    } else {
      setShownContext(context);
    }
  }

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
