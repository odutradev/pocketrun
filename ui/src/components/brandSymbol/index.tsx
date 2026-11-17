import { useId } from "react";

import {
  getSymbolColors,
  symbolBladeThickness,
  symbolBlades,
  symbolHandle,
  symbolHandleHeight,
  symbolPivot,
  symbolViewBox
} from "@utils/functions/brandAssets";

import { Svg } from "./styles";
import type { BrandSymbolProps } from "./types";

const fullFrame = { x: 0, y: 0, width: 96, height: 96 };

const BrandSymbol: React.FC<BrandSymbolProps> = ({
  size,
  context = "geral",
  palette = "dark",
  variant = "full",
  frame = "tight",
  title
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
        {symbolBlades.map(({ tool, angle, length }) => (
          <g key={tool} transform={`translate(${symbolPivot.x} ${symbolPivot.y}) rotate(${angle})`}>
            <rect x="0" y={-thickness / 2} width={length} height={thickness} rx={thickness / 2} fill={colors.blades[tool]} />
          </g>
        ))}
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
      </g>
    </Svg>
  );
};

export default BrandSymbol;
