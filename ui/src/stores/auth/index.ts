import { persist } from "zustand/middleware";
import { create } from "zustand";

import { storageKeys } from "@assets/config";

import type { AuthStore } from "./types";

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setSession: ({ user }) => set({ user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null })
    }),
    {
      name: storageKeys.auth,
      version: 1,
      partialize: ({ user }) => ({ user }),
      migrate: () => ({ user: null })
    }
  )
);

export default useAuthStore;
