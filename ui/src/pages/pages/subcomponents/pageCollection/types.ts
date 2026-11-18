import type { SitePage } from "@utils/types/sitePage";

export interface PageCollectionProps {
  sitePages: SitePage[];
  total: number;
  caption: string;
}
