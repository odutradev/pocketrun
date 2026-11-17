import { Block } from "./styles";
import type { SkeletonProps } from "./types";

// Bloco de carregamento. Monte o esqueleto com a mesma forma da tela final.
const Skeleton = ({ width = "100%", height, radius = "control" }: SkeletonProps) => (
  <Block aria-hidden="true" $width={width} $height={height} $radius={radius} />
);

export default Skeleton;
