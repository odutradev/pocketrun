import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  // Rótulo curto em mono acima do título, como "Painel do gestor".
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  // Conteúdo extra sob o título, como o Project ID copiável.
  children?: ReactNode;
}
