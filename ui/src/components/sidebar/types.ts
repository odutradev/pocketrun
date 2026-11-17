import type { ReactNode } from "react";

import type { Permission } from "@utils/types/user";

export interface SidebarItem {
  label: string;
  to: string;
  icon: ReactNode;
  matches: string[];
  requiredPermissions?: Permission[];
  badge?: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}
