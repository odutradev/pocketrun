import { Dot, Root } from "./styles";

import type { BadgeProps } from "./types";

const Badge = ({ children, tone = "neutral", hasDot = false, isMono = false }: BadgeProps) => (
  <Root $tone={tone} $isMono={isMono}>
    {hasDot && <Dot $tone={tone} aria-hidden="true" />}
    {children}
  </Root>
);

export default Badge;
