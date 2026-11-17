import type { ReactNode } from "react";

import type { Permission } from "@utils/types/user";

export interface SidebarItem {
  label: string;
  to: string;
  icon: ReactNode;
  // Prefixos de rota em que o item conta como ativo.
  matches: string[];
  requiredPermissions?: Permission[];
  // Selo curto à direita, como "Em breve" num serviço ainda não lançado.
  badge?: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}
