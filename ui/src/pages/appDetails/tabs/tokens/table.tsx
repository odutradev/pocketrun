import { Code, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

import { formatDate } from "@utils/functions";
import type { ApiToken } from "@utils/types/application";

export interface TokenColumn {
  key: string;
  header: string;
  render: (token: ApiToken) => ReactNode;
}

export const tokenColumns: TokenColumn[] = [
  {
    key: "prefix",
    header: "Prefixo",
    render: (token) => <Code size="1">{token.tokenPrefix}••••••••</Code>
  },
  {
    key: "createdAt",
    header: "Criado em",
    render: (token) => (
      <Text size="1" color="gray">
        {formatDate(token.createdAt)}
      </Text>
    )
  },
  {
    key: "expiresAt",
    header: "Expiração",
    render: (token) => (
      <Text size="1" color="gray">
        {token.expiresAt ? formatDate(token.expiresAt) : "Sem expiração"}
      </Text>
    )
  },
  {
    key: "lastUsedAt",
    header: "Último uso",
    render: (token) => (
      <Text size="1" color="gray">
        {token.lastUsedAt ? formatDate(token.lastUsedAt) : "Nunca"}
      </Text>
    )
  }
];
