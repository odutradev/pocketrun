import type { BrandContext } from "@utils/types/brand";
import type { Permission } from "@utils/types/user";



export type PageLayout = "panel" | "bare";

export interface PageMetadata {
  layout?: PageLayout;
  context?: BrandContext;
  privateRoute?: boolean;
  publicOnly?: boolean;
  setupOnly?: boolean;
  requiredPermissions?: Permission[];
}
