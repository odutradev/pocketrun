import type { KeyboardEvent } from "react";

import VisuallyHidden from "@components/visuallyHidden";

import { Caption, Cell, HeaderCell, Row, ScrollBox, Table } from "./styles";
import type { DataTableProps } from "./types";

const DataTable = <TRow,>({
  caption,
  columns,
  rows,
  getRowKey,
  selectedKey,
  onRowSelect,
  minWidth = "560px"
}: DataTableProps<TRow>): React.ReactElement => {
  const isSelectable = Boolean(onRowSelect);

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: TRow) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onRowSelect?.(row);
  };

  return (
    <ScrollBox>
      <Table $minWidth={minWidth}>
        <Caption>{caption}</Caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <HeaderCell key={column.key} scope="col" $align={column.align ?? "left"}>
                {column.isHeaderHidden ? <VisuallyHidden>{column.header}</VisuallyHidden> : column.header}
              </HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowKey = getRowKey(row);
            const isSelected = rowKey === selectedKey;

            return (
              <Row
                key={rowKey}
                tabIndex={isSelectable ? 0 : undefined}
                aria-selected={isSelectable ? isSelected : undefined}
                onClick={isSelectable ? () => onRowSelect?.(row) : undefined}
                onKeyDown={isSelectable ? (event) => handleKeyDown(event, row) : undefined}
                $isSelected={isSelected}
                $isSelectable={isSelectable}
              >
                {columns.map((column) => (
                  <Cell key={column.key} $align={column.align ?? "left"}>
                    {column.render(row)}
                  </Cell>
                ))}
              </Row>
            );
          })}
        </tbody>
      </Table>
    </ScrollBox>
  );
};

export default DataTable;
