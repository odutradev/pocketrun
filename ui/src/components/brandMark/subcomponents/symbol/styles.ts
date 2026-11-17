import styled, { css, keyframes } from "styled-components";

import { symbolMotion } from "@assets/config";
import { symbolPivot } from "@utils/functions/brandAssets";
import type { SymbolMotion, SymbolPose, SymbolStatus } from "@utils/types/brand";

const bladeTransform = (angle: number) => `translate(${symbolPivot.x}px, ${symbolPivot.y}px) rotate(${angle}deg)`;

const bladeOpen = (angle: number) => keyframes`
  from { transform: ${bladeTransform(0)}; }
  to { transform: ${bladeTransform(angle)}; }
`;

const bladeLoop = (angle: number) => keyframes`
  0%, 95%, 100% { transform: ${bladeTransform(0)}; }
  35%, 60% { transform: ${bladeTransform(angle)}; }
`;

const bladeSnap = (angle: number) => keyframes`
  0%, 100% { transform: ${bladeTransform(angle)}; }
  40% { transform: ${bladeTransform(angle - symbolMotion.snapDegrees)}; }
`;

const handleIn = keyframes`
  from { transform: translateX(-14px); opacity: 0; }
  to { transform: none; opacity: 1; }
`;

const ringPulse = keyframes`
  from { transform: scale(1); opacity: 0.9; }
  to { transform: scale(3.5); opacity: 0; }
`;

const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

export const Svg = styled.svg`
  display: block;
  flex-shrink: 0;
  overflow: visible;
`;

export const Blade = styled.g<{
  $rotation: number;
  $openAngle: number;
  $order: number;
  $pose: SymbolPose;
  $motion: SymbolMotion;
  $delay: number;
  $isStaggered: boolean;
  $isSnapping: boolean;
}>`
  transform: ${({ $rotation }) => bladeTransform($rotation)};
  transition: ${({ theme, $pose, $order, $isStaggered }) => {
    const step = $isStaggered ? $order : 0;
    if ($pose === "closed") {
      return `transform ${theme.motion.base}ms ${theme.motion.easing.standard} ${step * (theme.motion.stagger / 2)}ms`;
    }
    const duration = $isStaggered ? theme.motion.expressive : theme.motion.base;
    return `transform ${duration}ms ${theme.motion.easing.snap} ${step * theme.motion.stagger}ms`;
  }};

  rect {
    transition: fill ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};
  }

  ${({ theme, $motion, $openAngle, $order, $delay }) =>
    $motion === "intro" &&
    css`
      animation: ${bladeOpen($openAngle)} ${theme.motion.expressive}ms ${theme.motion.easing.snap}
        ${$delay + $order * theme.motion.stagger}ms backwards;
    `}

  ${({ theme, $motion, $openAngle, $order }) =>
    $motion === "loop" &&
    css`
      animation: ${bladeLoop($openAngle)} ${theme.motion.loop}ms ${theme.motion.easing.standard}
        ${$order * theme.motion.stagger}ms infinite both;
    `}

  ${({ theme, $isSnapping, $rotation }) =>
    $isSnapping &&
    css`
      animation: ${bladeSnap($rotation)} ${theme.motion.expressive}ms ${theme.motion.easing.snap};
    `}

  ${reducedMotion}
`;

export const Handle = styled.g<{ $motion: SymbolMotion }>`
  ${({ theme, $motion }) =>
    $motion === "intro" &&
    css`
      animation: ${handleIn} ${theme.motion.base}ms ${theme.motion.easing.standard} backwards;
    `}

  ${reducedMotion}
`;

export const Ring = styled.circle<{ $status: SymbolStatus }>`
  fill: none;
  stroke: ${({ theme, $status }) => ($status === "online" ? theme.brand.states.success : theme.brand.states.error)};
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
  transform-box: fill-box;
  transform-origin: center;
  animation: ${ringPulse} ${({ theme, $status }) => ($status === "online" ? theme.motion.pulse : theme.motion.pulse / 2)}ms
    ${({ theme }) => theme.motion.easing.standard} infinite;

  ${reducedMotion}
`;
