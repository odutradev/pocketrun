import type { PageSummary, PagesOverview } from "@utils/types/sitePage";
import type { LinkSummary, LinksOverview } from "@utils/types/link";
import type { Application } from "@utils/types/application";
import type { BrandTool } from "@utils/types/brand";

export interface EnvironmentOverview {
  applications: Application[];
  pageSummary: PageSummary;
  linkSummary: LinkSummary;
  pagesTraffic: PagesOverview;
  linksTraffic: LinksOverview;
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
