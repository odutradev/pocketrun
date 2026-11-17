import { Spinner, StyledButton } from "./styles";
import type { ButtonProps } from "./types";

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingLabel,
  leftIcon,
  rightIcon,
  isFullWidth = false,
  disabled,
  type = "button",
  ...props
}) => (
  <StyledButton
    type={type}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    $variant={variant}
    $size={size}
    $isFullWidth={isFullWidth}
    {...props}
  >
    {isLoading ? <Spinner aria-hidden="true" /> : leftIcon}
    {isLoading && loadingLabel ? loadingLabel : children}
    {!isLoading && rightIcon}
  </StyledButton>
);

export default Button;
