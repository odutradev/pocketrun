export type ApiErrorCode =
  | "validation_failed"
  | "invalid_body"
  | "internal_error"
  | "network_error"
  | "missing_authorization"
  | "invalid_authorization"
  | "invalid_token"
  | "invalid_credentials"
  | "too_many_login_attempts"
  | "invalid_client"
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
  | "self_redirect"
  | "invalid_page_id"
  | "page_not_found"
  | "page_too_large"
  | "invalid_version"
  | "version_not_found"
  | "invalid_key_id"
  | "invalid_pin"
  | "weak_pin"
  | "invalid_role"
  | "no_access_keys"
  | "last_access_key"
  | "too_many_access_keys"
  | "access_key_not_found"
  | "pin_in_use"
  | "pin_unavailable"
  | "role_taken"
  | "access_conflict"
  | "role_not_found"
  | "role_reserved"
  | "invalid_role_name"
  | "invalid_rule"
  | "too_many_roles"
  | "role_in_use"
  | "application_owned_by_page"
  | "kv_not_linked"
  | "kv_application_missing";

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

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
