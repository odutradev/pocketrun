import { Code, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

import { formatDateTime } from "@utils/functions";
import type { ExplorerDocument } from "@utils/types/explorer";

import { Summary } from "./styles";

export interface DocumentColumn {
  key: string;
  header: string;
  render: (document: ExplorerDocument) => ReactNode;
}

export const documentColumns: DocumentColumn[] = [
  {
    key: "id",
    header: "ID",
    render: (document) => <Code size="1">{document._id.slice(0, 10)}...</Code>
  },
  {
    key: "createdAt",
    header: "Criado em",
    render: (document) => (
      <Text size="1" color="gray">
        {formatDateTime(document.createdAt)}
      </Text>
    )
  },
  {
    key: "data",
    header: "Resumo de Dados",
    render: (document) => (
      <Summary size="1" color="gray">
        {JSON.stringify(document.data)}
      </Summary>
    )
  }
];

export const matchesSearch = (document: ExplorerDocument, search: string): boolean =>
  !search.trim() || JSON.stringify(document).toLowerCase().includes(search.trim().toLowerCase());
