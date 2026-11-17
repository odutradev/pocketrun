import axios, { isAxiosError } from "axios";

import { adminApiUrl } from "@assets/config";
import useAuthStore from "@stores/auth";
import type { ApiError, ApiErrorBody, ApiErrorCode } from "@utils/types/api";

const sessionErrors: ApiErrorCode[] = ["missing_authorization", "invalid_authorization", "invalid_token"];

const toApiError = (error: unknown): ApiError => {
  if (!isAxiosError<ApiErrorBody>(error) || !error.response) {
    return { code: "network_error", status: 0 };
  }
  const body = error.response.data;
  return {
    code: body?.error ?? "internal_error",
    status: error.response.status,
    fields: body?.fields
  };
};

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === "object" && error !== null && "code" in error && "status" in error;

const api = axios.create({
  baseURL: adminApiUrl,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const apiError = toApiError(error);
    if (sessionErrors.includes(apiError.code)) useAuthStore.getState().clearSession();
    return Promise.reject(apiError);
  }
);

export default api;
