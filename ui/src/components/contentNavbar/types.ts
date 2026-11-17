import type { ReactNode } from "react";

export interface ContentNavbarAction {
  label: string;
  icon: ReactNode;
  to?: string;
  onClick?: () => void;
  isDisabled?: boolean;
}

export interface ContentNavbarProps {
  title: string;
  info?: ReactNode;
  actions?: ReactNode;
  action?: ContentNavbarAction;
  onReload?: () => void;
  isReloading?: boolean;
}
