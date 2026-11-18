import { apiUrl, expiryWarningDays, linksUrl, pageRuntimeApiVersion } from "@assets/config";
import { errorMessages, htmlOptionalCloseTags, htmlRawTextTags, htmlVoidTags } from "@assets/data";
import { isApiError } from "@utils/api";

import type { Application, ApplicationFilter, ApplicationSort } from "@utils/types/application";
import type { ExpiryInfo } from "@utils/types/expiry";
import type { LogLevel } from "@utils/types/logger";
import type { Link, ListItem, LinkSort, LinkStateFilter, RuleItem } from "@utils/types/link";
import type { HtmlIssue, PageRuntimeInfo, SitePage } from "@utils/types/sitePage";

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

export const formatSessionHours = (hours: number): string => {
  if (hours % 24 === 0) return hours === 24 ? "1 dia" : `${hours / 24} dias`;
  return hours === 1 ? "1 hora" : `${hours} horas`;
};

const runtimeInsertPatterns = [/<head(\s[^>]*)?>/i, /<html(\s[^>]*)?>/i, /<!doctype[^>]*>/i];

const pageRuntimeScript = (info: string) =>
  `(function(info){if("pocketrun" in window)return;var page=Object.freeze(info);Object.defineProperty(window,"pocketrun",{value:Object.freeze({apiVersion:${pageRuntimeApiVersion},page:page}),enumerable:false});var date=new Date(page.updatedAt).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});console.log("%cPocketRun%c "+page.slug+" · v"+page.version+(page.isPreview?" · prévia do editor":" · atualizada em "+date),"background:#ffc93c;color:#111;font-weight:700;padding:1px 6px;border-radius:4px","color:inherit")})(${info});`;

export const injectPageRuntime = (html: string, page: PageRuntimeInfo): string => {
  const info = JSON.stringify(page).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const tag = `<script>${pageRuntimeScript(info)}</script>`;
  const match = runtimeInsertPatterns.map((pattern) => pattern.exec(html)).find((result) => result !== null);
  if (!match) return `${tag}\n${html}`;
  const end = match.index + match[0].length;
  return `${html.slice(0, end)}\n${tag}${html.slice(end)}`;
};

export const isWeakPin = (pin: string): boolean => {
  const digits = Array.from(pin);
  const isRepeated = (size: number) => digits.every((digit, index) => index < size || digit === digits[index - size]);
  const isSequence = (step: number) => digits.every((digit, index) => index === 0 || Number(digit) - Number(digits[index - 1]) === step);
  return isRepeated(1) || isRepeated(2) || isRepeated(3) || isSequence(1) || isSequence(-1);
};

export const randomPin = (length: number): string => {
  let pin = "";
  do {
    pin = Array.from(crypto.getRandomValues(new Uint32Array(length)), (value) => String(value % 10)).join("");
  } while (isWeakPin(pin));
  return pin;
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

export const publicLinkUrl = (slug: string): string => `${linksUrl}/${slug}`;

export const holdsWholeList = (total: number, pageSize: number, isFiltered: boolean): boolean => !isFiltered && total <= pageSize;

export const matchesListFilters = (item: ListItem, search: string, state: LinkStateFilter, fields: string[]): boolean => {
  const term = search.trim().toLowerCase();
  const matchesState = state === "all" || item.state === state;
  return matchesState && (!term || fields.some((value) => value.toLowerCase().includes(term)));
};

export const matchesLinkFilters = (link: Link, search: string, state: LinkStateFilter): boolean =>
  matchesListFilters(link, search, state, [link.title, link.slug, link.url]);

export const matchesPageFilters = (page: SitePage, search: string, state: LinkStateFilter): boolean =>
  matchesListFilters(page, search, state, [page.title, page.slug]);

const compareNewest = (first: ListItem, second: ListItem): number =>
  new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime() || second.id.localeCompare(first.id);

const upcomingExpiry = (item: ListItem, now: number): number => {
  const endsAt = item.endsAt ? new Date(item.endsAt).getTime() : Number.POSITIVE_INFINITY;
  return endsAt > now ? endsAt : Number.POSITIVE_INFINITY;
};

const compareExpiry = (first: number, second: number): number => (first === second ? 0 : first < second ? -1 : 1);

export const sortListBy = <T extends ListItem>(items: T[], sort: LinkSort, now: number): T[] => {
  const compareBySort = (first: T, second: T): number => {
    if (sort === "clicks") return second.clicks - first.clicks;
    if (sort === "title") return first.title.localeCompare(second.title, "pt-BR", { sensitivity: "base" });
    if (sort === "expiring") return compareExpiry(upcomingExpiry(first, now), upcomingExpiry(second, now));
    return 0;
  };
  return [...items].sort((first, second) => compareBySort(first, second) || compareNewest(first, second));
};

export const formatShortDateTime = (value: string): string =>
  new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export const urlHost = (value: string): string => {
  try {
    return new URL(value).host.replace(/^www\./, "");
  } catch {
    return value;
  }
};

export const describeLinkRule = (link: RuleItem): string | null => {
  if (link.mode !== "period") return null;
  if (link.state === "scheduled" && link.startsAt) return `Começa ${formatShortDateTime(link.startsAt)}`;
  if (!link.endsAt) return null;
  return link.state === "expired" ? `Terminou ${formatShortDateTime(link.endsAt)}` : `Até ${formatShortDateTime(link.endsAt)}`;
};

export const currentTimestamp = (): number => Date.now();

export const measureBytes = (value: string): number => new TextEncoder().encode(value).length;

export const formatBytes = (bytes: number): string =>
  bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB`;

export const fillPageTemplate = (html: string): string => html.replaceAll("\r\n", "\n").replaceAll("__POCKETRUN_API_URL__", apiUrl);

export const versionLabel = (number: number): string => `1.${Math.max(number, 1) - 1}`;

const htmlTokenPattern = /<!--[\s\S]*?(?:-->|$)|<![^>]*>?|<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)(>|$)/g;

export const findHtmlIssues = (html: string): HtmlIssue[] => {
  const issues: HtmlIssue[] = [];
  const open: { name: string; start: number; end: number }[] = [];
  const pattern = new RegExp(htmlTokenPattern.source, "g");
  const lowerHtml = html.toLowerCase();

  for (let match = pattern.exec(html); match; match = pattern.exec(html)) {
    const [token, slash, rawName, , selfClose, closing] = match;
    const start = match.index;
    const end = start + token.length;
    if (token.length === 0) {
      pattern.lastIndex += 1;
      continue;
    }

    if (token.startsWith("<!--")) {
      if (!token.endsWith("-->")) issues.push({ start, end: start + 4, message: 'O comentário não foi fechado: falta o "-->".' });
      continue;
    }
    if (!rawName) continue;

    const name = rawName.toLowerCase();
    if (closing !== ">") {
      issues.push({ start, end: start + 1 + slash.length + rawName.length, message: `A tag <${slash}${name}> não terminou: falta o ">".` });
      break;
    }

    if (slash) {
      if (htmlVoidTags.has(name)) {
        issues.push({ start, end, message: `<${name}> não tem fechamento: tire o </${name}>.` });
        continue;
      }
      const index = open.findLastIndex((tag) => tag.name === name);
      if (index === -1) {
        issues.push({ start, end, message: `</${name}> fecha uma tag que não está aberta.` });
        continue;
      }
      open
        .splice(index)
        .slice(1)
        .filter((tag) => !htmlOptionalCloseTags.has(tag.name))
        .forEach((tag) => issues.push({ start: tag.start, end: tag.end, message: `A tag <${tag.name}> não foi fechada antes do </${name}>.` }));
      continue;
    }

    if (selfClose || htmlVoidTags.has(name)) continue;

    if (htmlRawTextTags.has(name)) {
      const closeIndex = lowerHtml.indexOf(`</${name}`, end);
      if (closeIndex === -1) {
        issues.push({ start, end, message: `A tag <${name}> foi aberta e não foi fechada.` });
        break;
      }
      pattern.lastIndex = closeIndex;
    }
    open.push({ name, start, end });
  }

  open
    .filter((tag) => !htmlOptionalCloseTags.has(tag.name))
    .forEach((tag) => issues.push({ start: tag.start, end: tag.end, message: `A tag <${tag.name}> foi aberta e não foi fechada.` }));

  return issues.sort((a, b) => a.start - b.start);
};

export const formatRelativeTime = (value: string, now: number): string => {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60]
  ];
  const [unit, size] = units.find(([, length]) => Math.abs(seconds) >= length) ?? ["second", 1];
  if (unit === "second") return "agora mesmo";
  return new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(Math.round(seconds / size), unit);
};

export const formatTime = (value: string): string =>
  new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const toDayKey = (value: string): string => new Date(value).toLocaleDateString("sv-SE");

export const formatDayHeading = (value: string, now: number): string => {
  const today = toDayKey(new Date(now).toISOString());
  const yesterday = toDayKey(new Date(now - 86400000).toISOString());
  const key = toDayKey(value);
  if (key === today) return "Hoje";
  if (key === yesterday) return "Ontem";
  return new Date(value).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
};

export const getInitials = (name: string): string =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const formatPercentChange = (current: number, previous: number | null): string | null => {
  if (previous === null) return null;
  if (previous === 0) return current === 0 ? "Igual ao período anterior" : "Sem acessos no período anterior";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "Igual ao período anterior";
  return `${change > 0 ? "+" : ""}${change}% vs. período anterior`;
};

export const downloadCsv = (fileName: string, rows: (string | number)[][]): void => {
  const content = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
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

export const countTokens = (application: Application): number => application.tokens?.length ?? 0;

export const lastTokenUse = (application: Application): string | null =>
  (application.tokens ?? [])
    .map((token) => token.lastUsedAt)
    .filter((value): value is string => value !== null)
    .reduce<string | null>((latest, value) => (latest && latest > value ? latest : value), null);

export const describeLastUse = (application: Application): string => {
  const lastUse = lastTokenUse(application);
  return lastUse ? `Usada ${formatRelativeTime(lastUse, currentTimestamp())}` : "Nunca usada";
};

export const matchesApplicationFilters =(application: Application, search: string, filter: ApplicationFilter): boolean => {
  const term = search.trim().toLowerCase();
  const isOpen = allowsAnyOrigin(application.allowedOrigins);
  const matchesFilter =
    filter === "all" ||
    (filter === "open" && isOpen) ||
    (filter === "restricted" && !isOpen) ||
    (filter === "noTokens" && countTokens(application) === 0);
  const fields = [application.name, application.projectId, application.description];
  return matchesFilter && (!term || fields.some((value) => value.toLowerCase().includes(term)));
};

export const sortApplications = (applications: Application[], sort: ApplicationSort): Application[] => {
  const compareNewest = (first: Application, second: Application) =>
    new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime() || second.id.localeCompare(first.id);
  const compareBySort = (first: Application, second: Application): number => {
    if (sort === "name") return first.name.localeCompare(second.name, "pt-BR", { sensitivity: "base" });
    if (sort === "tokens") return countTokens(second) - countTokens(first);
    return 0;
  };
  return [...applications].sort((first, second) => compareBySort(first, second) || compareNewest(first, second));
};

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
