import type { ButtonVariant } from "@components/button/types";
import type { ReactNode } from "react";

export interface ContentNavbarAction {
  label: string;
  icon: ReactNode;
  to?: string;
  onClick?: () => void;
  isDisabled?: boolean;
  variant?: ButtonVariant;
}

export interface ContentNavbarProps {
  title: string;
  info?: ReactNode;
  actions?: ReactNode;
  action?: ContentNavbarAction;
  onReload?: () => void;
  isReloading?: boolean;
}
