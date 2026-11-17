import { create } from "zustand";

import { rolePermissions } from "@assets/data";

import type { Permission, UserRole } from "@utils/types/user";
import type { ApiHealthStatus } from "@utils/types/api";



interface SystemStore {
  apiStatus: ApiHealthStatus;
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
