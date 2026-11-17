import { persist } from "zustand/middleware";
import { create } from "zustand";

import { storageKeys } from "@assets/config";

import type { Session, User } from "@utils/types/user";

interface AuthStore {
  token: string | null;
  user: User | null;
  setSession: (session: Session) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

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
