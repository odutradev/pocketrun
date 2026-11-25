import { formatRelativeTime } from "@utils/functions";
import { Mono, Muted } from "../../styles";
import Badge from "@components/badge";

import type { DataTableColumn } from "@components/dataTable/types";
import type { PageKvLoggedRequest } from "@utils/types/sitePage";

const describeSubject = (request: PageKvLoggedRequest): string => {
  const kvRole = request.kvRole || "sem cargo";
  if (request.pageRole) return `${kvRole} · PIN ${request.pageRole}`;
  return kvRole;
};

export const requestColumns = (now: number): DataTableColumn<PageKvLoggedRequest>[] => [
  {
    key: "at",
    header: "Quando",
    render: (request) => <Muted title={new Date(request.at).toLocaleString("pt-BR")}>{formatRelativeTime(request.at, now)}</Muted>
  },
  {
    key: "route",
    header: "Pedido",
    render: (request) => (
      <Mono>
        {request.collection}/{request.action}
      </Mono>
    )
  },
  { key: "role", header: "Cargo", render: (request) => <Muted>{describeSubject(request)}</Muted> },
  {
    key: "result",
    header: "Resultado",
    render: (request) =>
      request.status >= 200 && request.status < 300 ? (
        <Badge tone="success">{request.status}</Badge>
      ) : (
        <Badge tone="error" isMono>
          {request.status} {request.code}
        </Badge>
      )
  },
  { key: "origin", header: "Origem", render: (request) => <Badge>{request.isPreview ? "Prévia" : "Página"}</Badge> }
];
