import type { ApiErrorCode } from "@utils/types/api";
import type { Permission, UserRole } from "@utils/types/user";

export const errorMessages: Record<ApiErrorCode, string> = {
  validation_failed: "Alguns campos estão inválidos.",
  invalid_body: "Requisição inválida.",
  internal_error: "Erro interno no servidor. Tente novamente.",
  network_error: "Não foi possível conectar à API.",
  missing_authorization: "Sessão não encontrada. Entre novamente.",
  invalid_authorization: "Sessão inválida. Entre novamente.",
  invalid_token: "Sessão expirada. Entre novamente.",
  invalid_credentials: "E-mail ou senha inválidos.",
  registration_disabled: "O cadastro público está desativado. Fale com o administrador.",
  setup_required: "Configuração inicial pendente. Use o assistente de setup.",
  setup_completed: "A configuração inicial já foi concluída.",
  user_not_found: "Usuário não encontrado.",
  email_taken: "Este e-mail já está em uso.",
  invalid_application_id: "Aplicação inválida.",
  application_not_found: "Aplicação não encontrada.",
  token_not_found: "Token não encontrado.",
  project_id_taken: "Este Project ID já está em uso."
};

export const rolePermissions: Record<UserRole, Permission[]> = {
  superadmin: ["manage_apps"],
  admin: ["manage_apps"]
};

export const tokenValidityOptions = [
  { value: 30, label: "30 Dias" },
  { value: 90, label: "90 Dias (3 meses)" },
  { value: 180, label: "180 Dias (6 meses)" },
  { value: 365, label: "365 Dias (1 ano)" },
  { value: 1095, label: "3 Anos" }
] as const;

export const defaultTokenValidity = 365;
