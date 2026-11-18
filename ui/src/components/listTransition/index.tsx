import { useLayoutEffect, useRef } from "react";
import { useTheme } from "styled-components";

import useMediaQuery from "@hooks/useMediaQuery";
import { Content, Frame } from "./styles";

import type { ListTransitionProps, SettledFrame } from "./types";

const ListTransition = ({ transitionKey, isBusy, children }: ListTransitionProps) => {
  const { motion } = useTheme();
  const shouldReduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const frameRef = useRef<HTMLDivElement>(null);
  const settledRef = useRef<SettledFrame | null>(null);
  const animationRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const previous = settledRef.current;
    const isNewContent = previous !== null && previous.key !== transitionKey;
    if (!isNewContent && (isBusy || animationRef.current?.playState === "running")) return;

    animationRef.current?.cancel();
    const height = frame.offsetHeight;
    settledRef.current = { key: transitionKey, height };
    if (!previous || !isNewContent || shouldReduceMotion || previous.height === height) return;

    frame.style.overflow = "hidden";
    const animation = frame.animate([{ height: `${previous.height}px` }, { height: `${height}px` }], {
      duration: motion.base,
      easing: motion.easing.standard
    });
    const releaseOverflow = () => frame.style.removeProperty("overflow");
    animation.onfinish = releaseOverflow;
    animation.oncancel = releaseOverflow;
    animationRef.current = animation;
  });

  return (
    <Frame ref={frameRef} aria-busy={isBusy} $isBusy={isBusy}>
      <Content key={transitionKey}>{children}</Content>
    </Frame>
  );
};

export default ListTransition;
