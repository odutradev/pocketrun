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
  | "project_id_taken"
  | "forbidden"
  | "invalid_user_id"
  | "self_action_forbidden"
  | "user_has_applications"
  | "invalid_current_password"
  | "invalid_link_id"
  | "link_not_found"
  | "invalid_group_id"
  | "group_not_found"
  | "group_name_taken"
  | "invalid_schedule"
  | "invalid_slug"
  | "reserved_slug"
  | "slug_taken"
  | "invalid_range"
  | "invalid_timezone"
  | "invalid_cursor"
  | "invalid_limit";

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
