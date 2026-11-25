import type { createApiKeySchema } from "@utils/validations/apiKey";
import type { z } from "zod";

export type ApiKeyScope = "read" | "write" | "full";

export interface AdminApiKey {
  id: string;
  userId: string;
  name: string;
  scope: ApiKeyScope;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreatedApiKey {
  key: AdminApiKey;
  rawKey: string;
}

export interface ApiKeyScopeOption {
  value: ApiKeyScope;
  label: string;
  description: string;
}

export type CreateApiKeyValues = z.infer<typeof createApiKeySchema>;

export type McpClient = "claudeCode" | "claudeDesktop";

export interface McpClientOption {
  value: McpClient;
  label: string;
}
