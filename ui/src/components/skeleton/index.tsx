import { Block } from "./styles";

import type { SkeletonProps } from "./types";

const Skeleton = ({ width = "100%", height, radius = "control" }: SkeletonProps) => (
  <Block aria-hidden="true" $width={width} $height={height} $radius={radius} />
);

export default Skeleton;
