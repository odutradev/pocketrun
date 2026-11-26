import type { applicationFormSchema, createTokenSchema, roleFormSchema } from "@utils/validations/application";
import type { AnalyticsBucket, AnalyticsRange } from "@utils/types/link";
import type { z } from "zod";

export interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  role: string;
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface Application {
  id: string;
  managerId: string;
  pageId: string | null;
  name: string;
  projectId: string;
  description: string;
  allowedOrigins: string[];
  allowNonBrowserRequests: boolean;
  tokens?: ApiToken[];
  roles: KvRole[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationPayload {
  name: string;
  projectId: string;
  description: string;
  allowedOrigins: string[];
  allowNonBrowserRequests: boolean;
}

export interface UpdateApplicationPayload {
  name: string;
  description: string;
  allowedOrigins: string[];
  allowNonBrowserRequests: boolean;
}

export interface CreatedApplication {
  application: Application;
  rawToken: string;
}

export interface CreateTokenPayload {
  name: string;
  validityDays: number;
  role: string;
}

export type KvOperation = "read" | "create" | "update" | "delete";

export interface KvRoleRule {
  collection: string;
  operations: KvOperation[];
  maxDocuments: number;
}

export interface KvRole {
  name: string;
  description: string;
  rules: KvRoleRule[];
  isOwnDocumentsOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePayload {
  name: string;
  description: string;
  rules: KvRoleRule[];
  isOwnDocumentsOnly: boolean;
}

export type RoleUpdatePayload = Omit<RolePayload, "name">;

export interface CreatedToken {
  token: ApiToken;
  rawToken: string;
}

export type ApplicationSort = "recent" | "name" | "tokens";

export type ApplicationFilter = "all" | "open" | "restricted" | "noTokens";

export type AppEditorTab = "explorer" | "settings" | "roles" | "tokens" | "analytics" | "json" | "snippets";

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
export type CreateTokenValues = z.infer<typeof createTokenSchema>;
export type RoleFormValues = z.infer<typeof roleFormSchema>;

export interface ApplicationConfigRole {
  name: string;
  description: string;
  isOwnDocumentsOnly: boolean;
  rules: KvRoleRule[];
}

export interface ApplicationConfigToken {
  id: string;
  name: string;
  role: string;
}

export interface ApplicationConfig {
  version: number;
  projectId: string;
  name: string;
  description: string;
  allowedOrigins: string[];
  allowNonBrowserRequests: boolean;
  roles: ApplicationConfigRole[];
  tokens: ApplicationConfigToken[];
}

export interface KvAnalyticsPoint {
  at: string;
  requests: number;
  failed: number;
}

export interface KvAnalyticsHeatCell {
  weekday: number;
  hour: number;
  requests: number;
}

export interface KvAnalyticsShare {
  name: string;
  requests: number;
}

export interface KvAnalyticsTotals {
  requests: number;
  failed: number;
  applications: number;
  collections: number;
  previousRequests: number | null;
  previousFailed: number | null;
}

export interface KvAnalytics {
  range: AnalyticsRange;
  bucket: AnalyticsBucket;
  from: string;
  to: string;
  totals: KvAnalyticsTotals;
  lastActiveAt: string | null;
  series: KvAnalyticsPoint[];
  heatmap: KvAnalyticsHeatCell[];
  operations: KvAnalyticsShare[];
  collections: KvAnalyticsShare[];
}

export interface RankedApplication {
  id: string;
  name: string;
  projectId: string;
  isPageApplication: boolean;
  requests: number;
  failed: number;
}

export interface KvOverview extends KvAnalytics {
  topApplications: RankedApplication[];
}
