import { create } from "zustand";

import { rolePermissions } from "@assets/data";

import type { SystemStore } from "./types";

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
