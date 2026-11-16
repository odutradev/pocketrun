const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

export const apiUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || "http://localhost:5001");

export const publicApiUrl = trimTrailingSlash(import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000");

export const storageKeys = {
  auth: "pocketrun_auth",
  system: "pocketrun_system"
} as const;

export const healthCheckInterval = 20000;

export const explorerPageSize = 15;

export const copyFeedbackDuration = 2000;
