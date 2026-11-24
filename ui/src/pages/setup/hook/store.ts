import { create } from "zustand";

import type { SetupStore } from "./types";

const useSetupStore = create<SetupStore>()((set) => ({
  setupToken: "",
  setSetupToken: (setupToken) => set({ setupToken }),
  clearSetupToken: () => set({ setupToken: "" })
}));

export default useSetupStore;
