import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  // Até duas ações.
  actions?: ReactNode;
  // Versão menor, para dentro de painéis e tabelas.
  isCompact?: boolean;
}
