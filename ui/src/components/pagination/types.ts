import type { ReactNode } from "react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  summary?: ReactNode;
  isCentered?: boolean;
}
