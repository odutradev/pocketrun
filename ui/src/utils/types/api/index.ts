export type ApiErrorCode =
  | "validation_failed"
  | "invalid_body"
  | "internal_error"
  | "network_error"
  | "missing_authorization"
  | "invalid_authorization"
  | "invalid_token"
  | "invalid_credentials"
  | "setup_completed"
  | "user_not_found"
  | "email_taken"
  | "invalid_application_id"
  | "application_not_found"
  | "token_not_found"
  | "project_id_taken";

export interface ApiErrorBody {
  error: ApiErrorCode;
  fields?: Record<string, string>;
}

export interface ApiError {
  code: ApiErrorCode;
  status: number;
  fields?: Record<string, string>;
}

export interface MessageResponse {
  message: string;
}

export interface PingResponse {
  status: string;
  message: string;
}

export type ApiHealthStatus = "online" | "offline";
