import { expiryWarningDays, apiUrl } from "@assets/config";
import { errorMessages } from "@assets/data";
import { isApiError } from "@utils/api";

import type { ExpiryInfo } from "@utils/types/expiry";
import type { LogLevel } from "@utils/types/logger";
import type { Link } from "@utils/types/link";

export const createLocalLogger = (scope: string) => {
  const write = (level: LogLevel) => (...args: unknown[]) => {
    if (!import.meta.env.DEV) return;
    console[level](`[${scope}]`, ...args);
  };
  return { info: write("info"), warn: write("warn"), error: write("error") };
};

export const getErrorMessage = (error: unknown, fallback: string): string =>
  isApiError(error) ? errorMessages[error.code] ?? fallback : fallback;

export const formatDate = (value: string): string => new Date(value).toLocaleDateString("pt-BR");

export const formatDateTime = (value: string): string => new Date(value).toLocaleString("pt-BR");

export const toProjectId = (value: string): string => value.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

export const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-");

export const randomSlug = (length: number): string => {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
};

export const toDateTimeInput = (value: string): string => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export const fromDateTimeInput = (value: string): string => new Date(value).toISOString();

export const hoursFromNow = (hours: number): string => toDateTimeInput(new Date(Date.now() + hours * 3600000).toISOString());

export const roundedHourFromNow = (hours: number): string => {
  const date = new Date(Date.now() + hours * 3600000);
  date.setMinutes(0, 0, 0);
  return toDateTimeInput(date.toISOString());
};

export const formatPeriodDate = (value: string): string =>
  new Date(value).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const easeOutCubic = (progress: number): number => 1 - (1 - progress) ** 3;

export const cancelFrame = (frameRef: { current: number | null }) => {
  if (frameRef.current === null) return;
  window.cancelAnimationFrame(frameRef.current);
  frameRef.current = null;
};

export const publicLinkUrl = (slug: string): string => `${apiUrl}/${slug}`;

export const formatShortDateTime = (value: string): string =>
  new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export const urlHost = (value: string): string => {
  try {
    return new URL(value).host.replace(/^www\./, "");
  } catch {
    return value;
  }
};

export const describeLinkRule = (link: Link): string | null => {
  if (link.mode !== "period") return null;
  if (link.state === "scheduled" && link.startsAt) return `Começa ${formatShortDateTime(link.startsAt)}`;
  if (!link.endsAt) return null;
  return link.state === "expired" ? `Terminou ${formatShortDateTime(link.endsAt)}` : `Até ${formatShortDateTime(link.endsAt)}`;
};

export const parseOrigins = (value: string): string[] => {
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  return origins.length > 0 ? origins : ["*"];
};

export const allowsAnyOrigin = (origins: string[]): boolean => origins.includes("*");

export const isLocalOrigin = (origin: string): boolean => /\/\/(localhost|127\.0\.0\.1)(:|$)/.test(origin);

export const pluralize = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

export const describeOrigins = (origins: string[]): string =>
  allowsAnyOrigin(origins) ? "Qualquer origem" : pluralize(origins.length, "origem", "origens");

export const daysUntil = (value: string): number => Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);

export const getExpiryInfo = (expiresAt: string | null | undefined): ExpiryInfo => {
  if (!expiresAt) return { state: "none" };
  const days = daysUntil(expiresAt);
  if (days <= 0) return { state: "expired", days };
  return { state: days <= expiryWarningDays ? "soon" : "active", days };
};

export const shortenId = (id: string): string => (id.length > 10 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id);

export const getInitial = (name: string): string => name.trim().charAt(0).toUpperCase() || "?";

export const getFieldIds = (controlId: string, flags: { hasHint?: boolean; hasError?: boolean } = {}) => {
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const describedBy = [flags.hasHint ? hintId : "", flags.hasError ? errorId : ""].filter(Boolean).join(" ");
  return { hintId, errorId, describedBy: describedBy || undefined };
};

export const getTabIds = (prefix: string, value: string) => ({
  tabId: `${prefix}-tab-${value}`,
  panelId: `${prefix}-panel-${value}`
});
