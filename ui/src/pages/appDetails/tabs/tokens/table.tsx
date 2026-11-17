import { TrashIcon } from "@radix-ui/react-icons";

import { MutedText, Name, Prefix } from "./styles";
import ExpiryBadge from "@components/expiryBadge";
import IconButton from "@components/iconButton";
import { formatDate } from "@utils/functions";

import type { DataTableColumn } from "@components/dataTable/types";
import type { ApiToken } from "@utils/types/application";

export const getTokenColumns = (onRevoke: (token: ApiToken) => void): DataTableColumn<ApiToken>[] => [
  {
    key: "name",
    header: "Nome",
    render: (token) => <Name>{token.name}</Name>
  },
  {
    key: "prefix",
    header: "Prefixo",
    render: (token) => <Prefix>{token.tokenPrefix}</Prefix>
  },
  {
    key: "status",
    header: "Status",
    render: (token) => <ExpiryBadge expiresAt={token.expiresAt} noneLabel="Ativo" isStatus />
  },
  {
    key: "expiresAt",
    header: "Expira em",
    render: (token) => <MutedText>{token.expiresAt ? formatDate(token.expiresAt) : "Nunca"}</MutedText>
  },
  {
    key: "lastUsedAt",
    header: "Último uso",
    render: (token) => <MutedText>{token.lastUsedAt ? formatDate(token.lastUsedAt) : "Nunca usado"}</MutedText>
  },
  {
    key: "actions",
    header: "Ações",
    align: "right",
    isHeaderHidden: true,
    render: (token) => (
      <IconButton variant="danger" size="sm" label={`Revogar o token ${token.name}`} icon={<TrashIcon />} onClick={() => onRevoke(token)} />
    )
  }
];
