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
