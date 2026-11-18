import type { linkFormSchema, linkGroupSchema } from "@utils/validations/link";
import type { ComponentType } from "react";
import type { z } from "zod";

export type LinkMode = "active" | "inactive" | "period" | "clicks";

export type LinkState = "active" | "inactive" | "scheduled" | "expired" | "exhausted";

export type LinkStateFilter = LinkState | "all";

export type LinkSort = "recent" | "clicks" | "title" | "expiring";

export type PeriodPreset = "1h" | "1d" | "7d" | "30d" | "custom";

export interface PeriodPresetOption {
  value: PeriodPreset;
  label: string;
  hours: number | null;
}

export type LinksView = "list" | "cards";

export type UrlProtocol = "https" | "http" | "manual";

export interface UrlProtocolOption {
  value: UrlProtocol;
  label: string;
}

export type SlugUnavailableReason = "invalid" | "reserved" | "taken";

export interface Link {
  id: string;
  title: string;
  slug: string;
  url: string;
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

export interface LinkGroup {
  id: string;
  kind: "links";
  name: string;
  color: GroupColor;
  icon: GroupIcon;
  createdAt: string;
  updatedAt: string;
}

export interface GroupColorOption {
  value: GroupColor;
  label: string;
}

export interface GroupIconOption {
  value: GroupIcon;
  label: string;
  icon: ComponentType;
}

export type LinkGroupTab = "links" | "settings";

export interface LinkListParams {
  groupId?: string;
  search?: string;
  state?: LinkState;
  sort?: LinkSort;
  page: number;
  limit: number;
}

export interface LinkGroupTotals {
  groupId: string;
  links: number;
  clicks: number;
}

export interface LinkSummary {
  total: number;
  ungrouped: number;
  groups: LinkGroupTotals[];
}

export interface SlugAvailability {
  slug: string;
  isAvailable: boolean;
  reason?: SlugUnavailableReason;
}

export interface LinkPayload {
  title: string;
  slug: string;
  url: string;
  groupId: string;
  mode: LinkMode;
  startsAt: string | null;
  endsAt: string | null;
  maxClicks: number | null;
}

export type LinkFormValues = z.infer<typeof linkFormSchema>;
export type LinkGroupValues = z.infer<typeof linkGroupSchema>;
export type GroupColor = LinkGroupValues["color"];
export type GroupIcon = LinkGroupValues["icon"];

export type LinkEditorTab = "settings" | "qrcode" | "analytics" | "history";

export type QrSize = "256" | "512" | "1024" | "2048";

export type QrLevel = "L" | "M" | "Q" | "H";

export type QrMargin = "0" | "2" | "4";

export type LinkEventType = "created" | "updated" | "deleted" | "expired" | "exhausted" | "group_detached";

export type LinkChangeField = "title" | "slug" | "url" | "groupId" | "mode" | "startsAt" | "endsAt" | "maxClicks";

export type LinkChangeValue = string | number | null;

export type HistoryFilter = "all" | "people" | "system";

export interface LinkEventActor {
  id: string | null;
  name: string;
  email: string;
}

export interface LinkChange {
  field: LinkChangeField;
  from: LinkChangeValue;
  to: LinkChangeValue;
}

export interface LinkEvent {
  id: string;
  linkId: string;
  type: LinkEventType;
  actor: LinkEventActor;
  changes: LinkChange[];
  at: string;
}

export interface LinkHistoryPage {
  events: LinkEvent[];
  nextCursor: string | null;
  total: number;
}

export interface LinkHistoryParams {
  before?: string;
  limit: number;
}

export type AnalyticsRange = "24h" | "7d" | "30d" | "90d" | "all";

export type AnalyticsBucket = "hour" | "day" | "week";

export interface AnalyticsPoint {
  at: string;
  clicks: number;
  visitors: number;
}

export interface AnalyticsHeatCell {
  weekday: number;
  hour: number;
  clicks: number;
}

export interface AnalyticsShare {
  name: string;
  clicks: number;
}

export interface AnalyticsTotals {
  clicks: number;
  visitors: number;
  bots: number;
  previousClicks: number | null;
  previousVisitors: number | null;
}

export interface LinkAnalytics {
  range: AnalyticsRange;
  bucket: AnalyticsBucket;
  from: string;
  to: string;
  totals: AnalyticsTotals;
  lastClickAt: string | null;
  series: AnalyticsPoint[];
  heatmap: AnalyticsHeatCell[];
  referrers: AnalyticsShare[];
  devices: AnalyticsShare[];
  systems: AnalyticsShare[];
  browsers: AnalyticsShare[];
}

export interface RankedLink {
  id: string;
  title: string;
  slug: string;
  clicks: number;
  visitors: number;
}

export interface LinksOverview extends LinkAnalytics {
  topLinks: RankedLink[];
}
