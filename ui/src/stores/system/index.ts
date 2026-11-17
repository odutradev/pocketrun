import { create } from "zustand";

import { rolePermissions } from "@assets/data";
import type { ApiHealthStatus } from "@utils/types/api";
import type { Permission, UserRole } from "@utils/types/user";

interface SystemStore {
  apiStatus: ApiHealthStatus;
  // null enquanto a API ainda não respondeu se a instância precisa de setup.
  isSetupRequired: boolean | null;
  setApiStatus: (apiStatus: ApiHealthStatus) => void;
  setSetupRequired: (isSetupRequired: boolean) => void;
  hasPermissions: (role: UserRole | undefined, required: Permission[]) => boolean;
}

const useSystemStore = create<SystemStore>()((set) => ({
  apiStatus: "online",
  isSetupRequired: null,
  setApiStatus: (apiStatus) => set({ apiStatus }),
  setSetupRequired: (isSetupRequired) => set({ isSetupRequired }),
  hasPermissions: (role, required) => {
    const granted = role ? rolePermissions[role] ?? [] : [];
    return required.every((permission) => granted.includes(permission));
  }
}));

export default useSystemStore;
