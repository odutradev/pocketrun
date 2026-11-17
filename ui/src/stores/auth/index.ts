import { persist } from "zustand/middleware";
import { create } from "zustand";

import { storageKeys } from "@assets/config";

import type { AuthStore } from "./types";

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null })
    }),
    { name: storageKeys.auth }
  )
);

export default useAuthStore;
