import { Spinner } from "@radix-ui/themes";

import { StyledButton } from "./styles";
import type { ButtonProps } from "./types";

const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) => (
  <StyledButton disabled={disabled || loading} $fullWidth={fullWidth} {...props}>
    {loading ? <Spinner size="1" /> : leftIcon}
    {children}
    {!loading && rightIcon}
  </StyledButton>
);

export default Button;
