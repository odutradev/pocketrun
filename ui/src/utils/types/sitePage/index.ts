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
import type { pageFormSchema } from "@utils/validations/sitePage";
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
  restoredFrom?: number | null;
  message?: string;
}

export type PageFormValues = z.infer<typeof pageFormSchema>;

export type PageGroupTab = "pages" | "settings";

export type PageEditorTab = "editor" | "settings" | "versions" | "qrcode" | "analytics" | "history";

export type PageChangeField = "title" | "slug" | "version" | "groupId" | "mode" | "startsAt" | "endsAt" | "maxClicks";

export interface PageChange {
  field: PageChangeField;
  from: LinkChangeValue;
  to: LinkChangeValue;
}

export interface PageEvent {
  id: string;
  pageId: string;
  type: LinkEventType;
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
