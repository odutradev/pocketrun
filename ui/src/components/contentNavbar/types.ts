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

export interface ContentNavbarCrumb {
  label: string;
  to: string;
}

export interface ContentNavbarProps {
  title: string;
  parents?: ContentNavbarCrumb[];
  info?: ReactNode;
  actions?: ContentNavbarAction[];
  action?: ContentNavbarAction;
  onReload?: () => void;
  isReloading?: boolean;
}
