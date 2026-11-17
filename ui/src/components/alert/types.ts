import type { ReactNode } from "react";

export type AlertTone = "neutral" | "success" | "warning" | "error";

export interface AlertProps {
  children: ReactNode;
  tone?: AlertTone;
  title?: string;
  action?: ReactNode;
  // Faixa de largura total no topo da página, para problemas do sistema inteiro.
  isBanner?: boolean;
}
