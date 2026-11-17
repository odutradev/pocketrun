import type { ReactNode } from "react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // Texto à esquerda, como "15 de 248 documentos".
  summary?: ReactNode;
}
