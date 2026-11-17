import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "ghost" | "secondary" | "danger";

export type IconButtonSize = "sm" | "md";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}
