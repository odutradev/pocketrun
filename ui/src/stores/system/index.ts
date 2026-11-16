import { create } from "zustand";
import { persist } from "zustand/middleware";

import { storageKeys } from "@assets/config";
import { rolePermissions } from "@assets/data";
import type { Permission, UserRole } from "@utils/types/user";

export type ThemeAppearance = "dark" | "light";

interface SystemStore {
  theme: ThemeAppearance;
  toggleTheme: () => void;
  hasPermissions: (role: UserRole | undefined, required: Permission[]) => boolean;
}

const applyDocumentTheme = (theme: ThemeAppearance) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark", "light-theme", "dark-theme");
  root.classList.add(theme, `${theme}-theme`);
  root.setAttribute("data-theme", theme);
};

const useSystemStore = create<SystemStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggleTheme: () => {
        const theme: ThemeAppearance = get().theme === "dark" ? "light" : "dark";
        applyDocumentTheme(theme);
        set({ theme });
      },
      hasPermissions: (role, required) => {
        const granted = role ? rolePermissions[role] ?? [] : [];
        return required.every((permission) => granted.includes(permission));
      }
    }),
    {
      name: storageKeys.system,
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => applyDocumentTheme(state?.theme ?? "dark")
    }
  )
);

export default useSystemStore;
