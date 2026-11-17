import { create } from "zustand";

import type { AuthMode } from "./types";

interface AuthPageStore {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
}

const useAuthPageStore = create<AuthPageStore>()((set) => ({
  mode: "login",
  setMode: (mode) => set({ mode })
}));

export default useAuthPageStore;
