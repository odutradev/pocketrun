import { DataSummary, IdText, MutedText } from "./styles";
import { formatDate, shortenId } from "@utils/functions";
import ExpiryBadge from "@components/expiryBadge";

import type { DataTableColumn } from "@components/dataTable/types";
import type { ExplorerDocument } from "@utils/types/explorer";

export const documentColumns: DataTableColumn<ExplorerDocument>[] = [
  {
    key: "id",
    header: "Id",
    render: (document) => <IdText title={document._id}>{shortenId(document._id)}</IdText>
  },
  {
    key: "data",
    header: "Dados",
    render: (document) => <DataSummary>{JSON.stringify(document.data)}</DataSummary>
  },
  {
    key: "createdAt",
    header: "Criado em",
    render: (document) => <MutedText>{formatDate(document.createdAt)}</MutedText>
  },
  {
    key: "expiresAt",
    header: "Validade",
    render: (document) => <ExpiryBadge expiresAt={document.expiresAt} noneLabel="Sem validade" />
  }
];

export const matchesSearch = (document: ExplorerDocument, search: string): boolean =>
  !search.trim() || JSON.stringify(document).toLowerCase().includes(search.trim().toLowerCase());
