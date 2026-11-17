import { useId } from "react";

import { symbolMotion } from "@assets/config";
import {
  getSymbolColors,
  symbolBladeThickness,
  symbolBlades,
  symbolHandle,
  symbolHandleHeight,
  symbolPivot,
  symbolViewBox
} from "@utils/functions/brandAssets";
import type { SymbolPose } from "@utils/types/brand";

import { Blade, Handle, Ring, Svg } from "./styles";
import type { BrandSymbolProps } from "./types";

const fullFrame = { x: 0, y: 0, width: 96, height: 96 };

const defaultBladeOrder = symbolBlades.map(({ tool }) => tool);

const rotationFor = (pose: SymbolPose, angle: number, index: number) => {
  if (pose === "closed") return 0;
  if (pose === "open") return angle;
  return angle + symbolMotion.spreadDegrees * (index - 1) - symbolMotion.spreadTilt;
};

const BrandSymbol: React.FC<BrandSymbolProps> = ({
  size,
  context = "general",
  palette = "dark",
  variant = "full",
  frame = "tight",
  title,
  pose = "open",
  motion = "none",
  motionDelay = 0,
  bladeOrder = defaultBladeOrder,
  isStaggered = true,
  snapKey = 0,
  status
}) => {
  const maskId = `rivet-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const colors = getSymbolColors(context, palette);
  const box = frame === "full" ? fullFrame : symbolViewBox;
  const thickness = symbolBladeThickness[variant];
  const handleHeight = symbolHandleHeight[variant];
  const isTiny = variant === "tiny";

  return (
    <Svg
      width={(box.width * size) / box.height}
      height={size}
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {!isTiny && (
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="96" height="96" fill="#fff" />
            <circle cx={symbolPivot.x} cy={symbolPivot.y} r={symbolHandle.rivet} fill="#000" />
          </mask>
        </defs>
      )}
      <g mask={isTiny ? undefined : `url(#${maskId})`}>
        {symbolBlades.map(({ tool, angle, length }, index) => {
          const isSnapping = snapKey > 0 && tool === "data";
          return (
            <Blade
              key={isSnapping ? `${tool}-${snapKey}` : tool}
              $rotation={rotationFor(pose, angle, index)}
              $openAngle={angle}
              $order={bladeOrder.indexOf(tool)}
              $pose={pose}
              $motion={motion}
              $delay={motionDelay}
              $isStaggered={isStaggered}
              $isSnapping={isSnapping}
            >
              <rect
                x="0"
                y={-thickness / 2}
                width={length}
                height={thickness}
                rx={thickness / 2}
                fill={colors.blades[tool]}
              />
            </Blade>
          );
        })}
        <Handle $motion={motion}>
          {isTiny ? (
            <circle cx={symbolPivot.x} cy={symbolPivot.y} r={symbolHandle.tinyRadius} fill={colors.handle} />
          ) : (
            <rect
              x={symbolHandle.x}
              y={symbolPivot.y - handleHeight / 2}
              width={symbolHandle.width}
              height={handleHeight}
              rx={handleHeight / 2}
              fill={colors.handle}
            />
          )}
        </Handle>
      </g>
      {status && <Ring $status={status} cx={symbolPivot.x} cy={symbolPivot.y} r={symbolHandle.rivet} />}
    </Svg>
  );
};

export default BrandSymbol;
