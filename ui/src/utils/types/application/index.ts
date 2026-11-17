import type { createApplicationSchema, securitySettingsSchema, createTokenSchema } from "@utils/validations/application";
import type { z } from "zod";

export interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface Application {
  id: string;
  managerId: string;
  name: string;
  projectId: string;
  description: string;
  allowedOrigins: string[];
  allowNonBrowserRequests: boolean;
  tokens?: ApiToken[];
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
}

export interface CreatedToken {
  token: ApiToken;
  rawToken: string;
}

export type CreateApplicationValues = z.infer<typeof createApplicationSchema>;
export type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;
export type CreateTokenValues = z.infer<typeof createTokenSchema>;
