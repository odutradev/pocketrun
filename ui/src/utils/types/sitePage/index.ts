import type { LinkCountBy } from "@utils/types/link";
import type {
  HistoryFilter,
  LinkAnalytics,
  LinkChangeValue,
  LinkEventActor,
  LinkEventType,
  LinkGroup,
  LinkMode,
  LinkSort,
  LinkState
} from "@utils/types/link";
import type { pageAccessKeySchema, pageFormSchema } from "@utils/validations/sitePage";
import type { KvOperation, KvRole } from "@utils/types/application";
import type { z } from "zod";

export type {
  AnalyticsRange,
  GroupColor,
  GroupIcon,
  HistoryFilter,
  LinkAnalytics,
  LinkChangeValue,
  LinkEventActor,
  LinkGroupTab,
  LinkGroupValues,
  LinkHistoryParams,
  LinkMode,
  LinkSort,
  LinkState,
  LinkStateFilter,
  LinksView,
  PeriodPreset,
  QrLevel,
  QrMargin,
  QrSize,
  SlugAvailability,
  SlugUnavailableReason
} from "@utils/types/link";

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  html?: string;
  size: number;
  version: number;
  groupId: string | null;
  mode: LinkMode;
  startsAt: string | null;
  endsAt: string | null;
  maxClicks: number | null;
  countBy: LinkCountBy | "";
  uniqueVisitors: number;
  clicks: number;
  state: LinkState;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageGroup extends Omit<LinkGroup, "kind"> {
  kind: "pages";
}

export interface PageListParams {
  groupId?: string;
  search?: string;
  state?: LinkState;
  sort?: LinkSort;
  page: number;
  limit: number;
}

export interface PageGroupTotals {
  groupId: string;
  pages: number;
  clicks: number;
}

export interface PageSummary {
  total: number;
  ungrouped: number;
  groups: PageGroupTotals[];
}

export interface PagePayload {
  title: string;
  slug: string;
  html?: string;
  groupId: string;
  mode: LinkMode;
  startsAt: string | null;
  endsAt: string | null;
  maxClicks: number | null;
  countBy: LinkCountBy | "";
  restoredFrom?: number | null;
  message?: string;
}

export type PageFormValues = z.infer<typeof pageFormSchema>;

export type PageGroupTab = "pages" | "settings";

export type PageTemplate = "blank" | "kvCrud";

export type PageEditorTab = "editor" | "settings" | "versions" | "access" | "data" | "qrcode" | "analytics" | "history";

export type PageChangeField = "title" | "slug" | "version" | "groupId" | "mode" | "startsAt" | "endsAt" | "maxClicks" | "countBy" | "role" | "sessionHours" | "kvApplication" | "kvPublicRole" | "kvRoles";

export type PageEventType =
  | LinkEventType
  | "access_enabled"
  | "access_disabled"
  | "access_key_created"
  | "access_key_renamed"
  | "access_pin_reset"
  | "access_pin_viewed"
  | "access_key_removed"
  | "access_sessions_revoked"
  | "access_session_changed"
  | "access_locked"
  | "unlocked"
  | "kv_linked"
  | "kv_changed"
  | "kv_unlinked";

export interface PageChange {
  field: PageChangeField;
  from: LinkChangeValue;
  to: LinkChangeValue;
}

export interface PageEvent {
  id: string;
  targetId: string;
  type: PageEventType;
  actor: LinkEventActor;
  changes: PageChange[];
  at: string;
}

export interface PageHistoryPage {
  events: PageEvent[];
  nextCursor: string | null;
  total: number;
}

export interface PageVersion {
  id: string;
  pageId: string;
  number: number;
  label: string;
  html?: string;
  size: number;
  restoredFrom: number | null;
  message?: string;
  actor: LinkEventActor;
  createdAt: string;
}

export interface PageAccessKey {
  id: string;
  role: string;
  isRevealable: boolean;
  createdAt: string;
  pinUpdatedAt: string;
}

export interface PageAccess {
  pageId: string;
  isEnabled: boolean;
  keys: PageAccessKey[];
  sessionHours: number;
  updatedAt: string | null;
}

export interface PageAccessIssued {
  access: PageAccess;
  pin: string;
}

export interface PageRuntimeInfo {
  slug: string;
  title: string;
  version: number;
  updatedAt: string;
  isPreview: boolean;
}

export interface PageKvRuntimeRule {
  collection: string;
  operations: KvOperation[];
}

export interface PageKvRuntime {
  role: string;
  isOwnDocumentsOnly: boolean;
  rules: PageKvRuntimeRule[];
}

export interface PageRuntimeExtra {
  access: { isProtected: boolean; role: string | null };
  kv: PageKvRuntime | null;
  parentOrigin: string;
}

export interface PageKvRoleMapping {
  pageRole: string;
  kvRole: string;
}

export interface PageKvBinding {
  pageId: string;
  applicationId: string;
  publicRole: string;
  roles: PageKvRoleMapping[];
  updatedAt: string;
}

export interface PageKvApplication {
  id: string;
  pageId: string | null;
  name: string;
  projectId: string;
  roles: KvRole[];
}

export interface PageKvDetails {
  binding: PageKvBinding | null;
  application: PageKvApplication | null;
}

export interface PageKvPayload {
  publicRole: string;
  roles: PageKvRoleMapping[];
}

export interface PageKvLoggedRequest {
  id: string;
  action: string;
  collection: string;
  kvRole: string;
  pageRole: string;
  isPreview: boolean;
  status: number;
  code: string;
  at: string;
}

export interface PageKvRequestSummary {
  requests: PageKvLoggedRequest[];
  total: number;
  denied: number;
}

export interface PageKvPreviewCall {
  as: string;
  method: string;
  path: string;
  query: string;
  body?: unknown;
}

export interface PageKvPreviewResult {
  status: number;
  data: unknown;
}

export interface PageKvBridgeRequest {
  type: "pocketrun:kv:request";
  id: number;
  method: string;
  path: string;
  body?: unknown;
}

export interface PageAccessRevealed {
  pin: string;
}

export interface PageAccessKeyPayload {
  role: string;
  pin: string;
}

export type PageAccessKeyValues = z.infer<typeof pageAccessKeySchema>;

export type PageAccessDialogMode = "general" | "role" | "edit";

export interface PageAccessDialogState {
  mode: PageAccessDialogMode;
  key: PageAccessKey | null;
  pin: string;
}

export interface PageDraft {
  html: string;
  restoredFrom: number | null;
  message: string;
}

export interface StoredPageDraft extends PageDraft {
  baseVersion: number;
  savedAt: string;
}

export interface HtmlIssue {
  start: number;
  end: number;
  message: string;
}

export type VersionBase = "previous" | "draft" | `${number}`;

export interface RankedPage {
  id: string;
  title: string;
  slug: string;
  clicks: number;
  visitors: number;
}

export interface PagesOverview extends LinkAnalytics {
  topPages: RankedPage[];
}

export type PageHistoryFilter = HistoryFilter;
