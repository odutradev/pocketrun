import { adminRoleName, codeKeywords, codeLiterals, errorMessages, htmlOptionalCloseTags, htmlRawTextTags, htmlVoidTags, kvOperationOptions } from "@assets/data";
import { expiryWarningDays, linksUrl, pageRuntimeApiVersion } from "@assets/config";
import { isApiError } from "@utils/api";

import type { HtmlIssue, PageAccess, PageKvBridgeRequest, PageKvDetails, PageKvPreviewCall, PageKvRuntime, PageRuntimeExtra, PageRuntimeInfo, SitePage } from "@utils/types/sitePage";
import type { ApiToken, Application, ApplicationFilter, ApplicationSort, KvRoleRule } from "@utils/types/application";
import type { Link, ListItem, LinkSort, LinkStateFilter, RuleItem } from "@utils/types/link";
import type { CodeLanguage, CodeLine, CodeToken, CodeTokenKind } from "@utils/types/code";
import type { AttentionItem, KvSummary } from "@utils/types/overview";
import type { ExpiryInfo } from "@utils/types/expiry";
import type { LogLevel } from "@utils/types/logger";

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

const pageKvClientScript = `function createKV(cfg){var reserved={page:1,limit:1,pagination:1,sortBy:1,sortOrder:1,createdAfter:1,createdBefore:1};var rules=(cfg.rules||[]).map(function(rule){return Object.freeze({collection:rule.collection,operations:Object.freeze(rule.operations.slice())})});var pending={};var sequence=0;function ruleFor(name){var wildcard=null;for(var i=0;i<rules.length;i++){if(rules[i].collection===name)return rules[i];if(rules[i].collection==="*")wildcard=rules[i]}return wildcard}function can(name,operation){var rule=ruleFor(name);return Boolean(rule)&&rule.operations.indexOf(operation)>=0}function encode(query){var parts=[];if(query)Object.keys(query).forEach(function(key){var value=query[key];if(value===undefined)return;var text=reserved[key]||typeof value!=="string"?String(value):'"'+value+'"';parts.push(encodeURIComponent(key)+"="+encodeURIComponent(text))});return parts.length?"?"+parts.join("&"):""}function fail(status,body){var error=new Error(body&&body.error||"request_failed");error.name="PocketrunKVError";error.status=status;error.code=body&&body.error||"request_failed";error.fields=body&&body.fields||null;return error}function send(method,path,body){return new Promise(function(resolve,reject){sequence+=1;var id=sequence;pending[id]={resolve:resolve,reject:reject};window.parent.postMessage({type:"pocketrun:kv:request",id:id,method:method,path:path,body:body===undefined?undefined:JSON.parse(JSON.stringify(body))},cfg.parentOrigin)})}window.addEventListener("message",function(event){if(event.source!==window.parent)return;var message=event.data;if(!message||message.type!=="pocketrun:kv:response"||!pending[message.id])return;var entry=pending[message.id];delete pending[message.id];if(message.status>=200&&message.status<300)entry.resolve(message.data);else entry.reject(fail(message.status,message.data))});function options(extra,data){var body={data:data};if(extra&&extra.expiresInDays!==undefined)body.expiresInDays=extra.expiresInDays;if(extra&&extra.expiresAt!==undefined)body.expiresAt=extra.expiresAt;return body}function collection(name){var path=encodeURIComponent(name);return Object.freeze({name:name,list:function(query){return send("GET",path+"/get-all"+encode(query))},get:function(id){return send("GET",path+"/get/"+encodeURIComponent(id))},count:function(filters){return send("GET",path+"/count"+encode(filters))},eval:function(operation,field,filters){return send("POST",path+"/eval",{operation:operation,field:field||"",filters:filters||{}})},create:function(data,extra){return send("POST",path+"/create",options(extra,data))},update:function(id,data,extra){return send("PATCH",path+"/update/"+encodeURIComponent(id),options(extra,data))},replace:function(id,data,extra){return send("PUT",path+"/replace/"+encodeURIComponent(id),options(extra,data))},remove:function(id){return send("DELETE",path+"/delete/"+encodeURIComponent(id))},can:function(operation){return can(name,operation)}})}return Object.freeze({role:cfg.role,isOwnDocumentsOnly:Boolean(cfg.isOwnDocumentsOnly),rules:Object.freeze(rules),collection:collection,can:can})}`;

const pageRuntimeScript = (info: string, extra: string) =>
  `(function(info,extra){if("pocketrun" in window)return;var page=Object.freeze(info);${pageKvClientScript};var runtime={apiVersion:${pageRuntimeApiVersion},page:page,access:Object.freeze({isProtected:extra.access.isProtected,role:extra.access.role})};if(extra.kv)runtime.kv=createKV(Object.assign({parentOrigin:extra.parentOrigin},extra.kv));Object.defineProperty(window,"pocketrun",{value:Object.freeze(runtime),enumerable:false});var date=new Date(page.updatedAt).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});console.log("%cPocketRun%c "+page.slug+" · v"+page.version+(page.isPreview?" · prévia do editor":" · atualizada em "+date),"background:#ffc93c;color:#111;font-weight:700;padding:1px 6px;border-radius:4px","color:inherit")})(${info},${extra});`;

export const previewSubjectOptions = (access: PageAccess | null): { value: string; label: string }[] => [
  { value: "public", label: "Sem PIN" },
  ...(access?.keys ?? []).map((key) => (key.role ? { value: `role:${key.role}`, label: `Cargo ${key.role}` } : { value: "pin", label: "PIN geral" }))
];

const previewPageRole = (previewAs: string): string | null => {
  if (previewAs === "pin") return "";
  return previewAs.startsWith("role:") ? previewAs.slice("role:".length) : null;
};

export const describeKvRole = (details: PageKvDetails, roleName: string): PageKvRuntime => {
  if (!roleName || !details.application) return { role: "", isOwnDocumentsOnly: false, rules: [] };
  if (roleName === adminRoleName) return { role: roleName, isOwnDocumentsOnly: false, rules: [{ collection: "*", operations: ["read", "create", "update", "delete"] }] };
  const role = details.application.roles.find((item) => item.name === roleName);
  if (!role) return { role: "", isOwnDocumentsOnly: false, rules: [] };
  return { role: role.name, isOwnDocumentsOnly: role.isOwnDocumentsOnly, rules: role.rules.map((rule) => ({ collection: rule.collection, operations: rule.operations })) };
};

export const kvRoleFor = (details: PageKvDetails, pageRole: string | null): string => {
  if (!details.binding) return "";
  if (pageRole === null) return details.binding.publicRole;
  return details.binding.roles.find((mapping) => mapping.pageRole === pageRole)?.kvRole ?? "";
};

export const previewExtra = (details: PageKvDetails | null, previewAs: string): PageRuntimeExtra => {
  const pageRole = previewPageRole(previewAs);
  const access = { isProtected: pageRole !== null, role: pageRole };
  if (!details?.binding) return { access, kv: null, parentOrigin: window.location.origin };
  return { access, kv: describeKvRole(details, kvRoleFor(details, pageRole)), parentOrigin: window.location.origin };
};

const kvPreviewPathPattern = /^[A-Za-z0-9_-]{1,64}\/(get-all|count|eval|create|(get|update|replace|delete)\/[0-9a-f]{24})$/;

const kvPreviewMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"];

export const parseKvBridgeRequest = (data: unknown): PageKvBridgeRequest | null => {
  if (typeof data !== "object" || data === null) return null;
  const message = data as Partial<PageKvBridgeRequest>;
  if (message.type !== "pocketrun:kv:request" || typeof message.id !== "number") return null;
  if (typeof message.method !== "string" || typeof message.path !== "string") return null;
  return { type: message.type, id: message.id, method: message.method, path: message.path, body: message.body };
};

export const toKvPreviewCall = (request: PageKvBridgeRequest, previewAs: string): PageKvPreviewCall | null => {
  const [path = "", query = ""] = request.path.split("?", 2);
  if (!kvPreviewPathPattern.test(path) || !kvPreviewMethods.includes(request.method) || query.includes("#")) return null;
  return { as: previewAs, method: request.method, path, query, body: request.body };
};

const toInlineJson = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

export const injectPageRuntime = (html: string, page: PageRuntimeInfo, extra: PageRuntimeExtra): string => {
  const tag = `<script>${pageRuntimeScript(toInlineJson(page), toInlineJson(extra))}</script>`;
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

export const fillPageTemplate = (html: string): string => html.replaceAll("\r\n", "\n");

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

export const tokenRoleName = (token: ApiToken): string => token.role || adminRoleName;

export const countRoleTokens = (application: Application, role: string): number =>
  (application.tokens ?? []).filter((token) => tokenRoleName(token) === role).length;

export const describeRuleOperations = (rule: KvRoleRule): string =>
  kvOperationOptions
    .filter((option) => rule.operations.includes(option.value))
    .map((option) => option.label.toLowerCase())
    .join(", ");

export const describeRoleRule = (rule: KvRoleRule): string =>
  [
    rule.collection === "*" ? "Todas as coleções" : rule.collection,
    describeRuleOperations(rule),
    rule.maxDocuments > 0 ? `até ${rule.maxDocuments.toLocaleString("pt-BR")} documentos` : ""
  ]
    .filter(Boolean)
    .join(" · ");

export const applicationRoleOptions = (application: Application | null): { value: string; label: string }[] => [
  { value: adminRoleName, label: "admin · acesso total" },
  ...(application?.roles ?? []).map((role) => ({ value: role.name, label: role.description ? `${role.name} · ${role.description}` : role.name }))
];

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

const javascriptPattern =
  /(?<comment>\/\/[^\n]*)|(?<key>"(?:\\.|[^"\\])*"(?=\s*:)|[A-Za-z_$][\w$]*(?=\s*:(?!:)))|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?<number>\b\d+(?:\.\d+)?\b)|(?<function>[A-Za-z_$][\w$]*(?=\())|(?<word>[A-Za-z_$][\w$]*)|(?<punctuation>[{}()[\],.;:=<>+\-*/!?&|]+)/g;

const jsonPattern =
  /(?<key>"(?:\\.|[^"\\])*"(?=\s*:))|(?<string>"(?:\\.|[^"\\])*")|(?<literal>\btrue\b|\bfalse\b|\bnull\b)|(?<number>-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(?<punctuation>[{}[\],:]+)/g;

const wordKind = (text: string): CodeTokenKind => {
  if (codeKeywords.includes(text)) return "keyword";
  if (codeLiterals.includes(text)) return "literal";
  return "plain";
};

const matchKind = (groups: Record<string, string | undefined>): CodeTokenKind => {
  const [name] = Object.entries(groups).find(([, value]) => value !== undefined) ?? ["plain"];
  if (name === "word") return wordKind(groups.word ?? "");
  return name as CodeTokenKind;
};

const tokenizeLine = (line: string, pattern: RegExp): CodeToken[] => {
  const matches = [...line.matchAll(pattern)];
  const tokens = matches.flatMap((match, index): CodeToken[] => {
    const start = match.index ?? 0;
    const previousEnd = index === 0 ? 0 : (matches[index - 1].index ?? 0) + matches[index - 1][0].length;
    const gap: CodeToken[] = start > previousEnd ? [{ kind: "plain", text: line.slice(previousEnd, start) }] : [];
    return [...gap, { kind: matchKind(match.groups ?? {}), text: match[0] }];
  });
  const last = matches.at(-1);
  const end = last ? (last.index ?? 0) + last[0].length : 0;
  return end < line.length ? [...tokens, { kind: "plain", text: line.slice(end) }] : tokens;
};

const patternFor = (language: CodeLanguage): RegExp | null => {
  if (language === "json") return jsonPattern;
  if (language === "javascript") return javascriptPattern;
  return null;
};

export const toCodeLines = (code: string, language: CodeLanguage): CodeLine[] => {
  const pattern = patternFor(language);
  return code.split("\n").map((line) => ({
    indent: line.length - line.trimStart().length,
    tokens: pattern ? tokenizeLine(line, pattern) : [{ kind: "plain", text: line }]
  }));
};

export const summarizeKv = (applications: Application[]): KvSummary => {
  const tokens = applications.flatMap((application) => application.tokens ?? []);
  const states = tokens.map((token) => getExpiryInfo(token.expiresAt).state);
  return {
    applications: applications.length,
    pageApplications: applications.filter((application) => application.pageId).length,
    tokens: tokens.length,
    activeTokens: states.filter((state) => state !== "expired").length,
    expiringTokens: states.filter((state) => state === "soon").length,
    expiredTokens: states.filter((state) => state === "expired").length,
    openApplications: applications.filter((application) => !application.pageId && allowsAnyOrigin(application.allowedOrigins)).length,
    roles: applications.reduce((total, application) => total + application.roles.length, 0)
  };
};

export const listAttentionItems = (applications: Application[]): AttentionItem[] =>
  applications.flatMap((application): AttentionItem[] => {
    const tokens = application.tokens ?? [];
    const expired = tokens.filter((token) => getExpiryInfo(token.expiresAt).state === "expired").length;
    const expiring = tokens.filter((token) => getExpiryInfo(token.expiresAt).state === "soon").length;
    const to = `/kv/${application.id}/edit`;
    return [
      ...(expired > 0
        ? [{ key: `${application.id}-expired`, tone: "error" as const, tool: "data" as const, title: application.name, description: `${pluralize(expired, "token vencido", "tokens vencidos")}. Gere outro na aba Tokens.`, to }]
        : []),
      ...(expiring > 0
        ? [{ key: `${application.id}-soon`, tone: "warning" as const, tool: "data" as const, title: application.name, description: `${pluralize(expiring, "token vence", "tokens vencem")} em até ${expiryWarningDays} dias.`, to }]
        : []),
      ...(!application.pageId && allowsAnyOrigin(application.allowedOrigins)
        ? [{ key: `${application.id}-open`, tone: "neutral" as const, tool: "data" as const, title: application.name, description: "Aceita chamadas de qualquer site. Limite as origens na Configuração.", to }]
        : [])
    ];
  });
