import { StyledIconButton } from "./styles";

import type { IconButtonProps } from "./types";

const IconButton = ({
  label,
  icon,
  variant = "ghost",
  size = "md",
  type = "button",
  ...props
}: IconButtonProps) => (
  <StyledIconButton type={type} aria-label={label} title={label} $variant={variant} $size={size} {...props}>
    {icon}
  </StyledIconButton>
);

export default IconButton;
