import type { ReactNode } from "react";

export type ColumnAlign = "left" | "center" | "right";

export interface DataTableColumn<TRow> {
  key: string;
  header: string;
  render: (row: TRow) => ReactNode;
  align?: ColumnAlign;
  // Esconde o texto do cabeçalho, mantendo-o para leitores de tela (coluna de ações).
  isHeaderHidden?: boolean;
}

export interface DataTableProps<TRow> {
  // Descrição da tabela para leitores de tela.
  caption: string;
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow) => string;
  // Com `onRowSelect`, as linhas viram selecionáveis por clique, Enter ou espaço.
  selectedKey?: string | null;
  onRowSelect?: (row: TRow) => void;
  minWidth?: string;
}
