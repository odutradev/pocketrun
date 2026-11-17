import type { ReactNode } from "react";

// "accent" segue o contexto (aço no geral, cor da ferramenta dentro dela); os outros são estados.
export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error";

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  // Ponto colorido antes do texto: estado nunca depende só da cor.
  hasDot?: boolean;
  isMono?: boolean;
}
