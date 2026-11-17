import type { ButtonSize, ButtonVariant } from "@components/button/types";
import type { ReactNode } from "react";

export interface LinkButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isFullWidth?: boolean;
  isExternal?: boolean;
}
