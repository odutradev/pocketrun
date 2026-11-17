import type { ButtonHTMLAttributes, ReactNode } from "react";

// "primary" usa a cor do contexto: aço no painel geral, a cor da ferramenta dentro dela.
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerSolid";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonStyleProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $isFullWidth: boolean;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  // Texto mostrado enquanto carrega, como "Salvando…".
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isFullWidth?: boolean;
}
