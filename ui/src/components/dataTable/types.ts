import type { ReactNode } from "react";

export type ColumnAlign = "left" | "center" | "right";

export interface DataTableColumn<TRow> {
  key: string;
  header: string;
  render: (row: TRow) => ReactNode;
  align?: ColumnAlign;
  isHeaderHidden?: boolean;
}

export interface DataTableProps<TRow> {
  caption: string;
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow) => string;
  selectedKey?: string | null;
  onRowSelect?: (row: TRow) => void;
  minWidth?: string;
}
