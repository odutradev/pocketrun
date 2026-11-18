import type { PageColumnsOptions } from "../../types";
import type { SitePage } from "@utils/types/sitePage";

export interface PageCardsProps extends PageColumnsOptions {
  sitePages: SitePage[];
  isCompact?: boolean;
}
