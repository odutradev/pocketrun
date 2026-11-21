import type { AnalyticsBucket, AnalyticsRange, LinkSummary, LinksOverview } from "@utils/types/link";
import type { PageSummary, PagesOverview } from "@utils/types/sitePage";
import type { Application } from "@utils/types/application";
import type { BrandTool } from "@utils/types/brand";

export interface UsagePoint {
  at: string;
  pages: number;
  links: number;
  kv: number;
}

export interface UsageTotals {
  pages: number;
  links: number;
  kv: number;
  previousPages: number | null;
  previousLinks: number | null;
  previousKv: number | null;
}

export interface EnvironmentUsage {
  range: AnalyticsRange;
  bucket: AnalyticsBucket;
  from: string;
  to: string;
  totals: UsageTotals;
  series: UsagePoint[];
}

export interface EnvironmentOverview {
  applications: Application[];
  pageSummary: PageSummary;
  linkSummary: LinkSummary;
  pagesTraffic: PagesOverview;
  linksTraffic: LinksOverview;
  usage: EnvironmentUsage;
}

export interface KvSummary {
  applications: number;
  pageApplications: number;
  tokens: number;
  activeTokens: number;
  expiringTokens: number;
  expiredTokens: number;
  openApplications: number;
  roles: number;
}

export type AttentionTone = "warning" | "error" | "neutral";

export interface AttentionItem {
  key: string;
  tone: AttentionTone;
  tool: BrandTool;
  title: string;
  description: string;
  to: string;
}
