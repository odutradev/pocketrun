import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { listApiKeys } from "@actions/auth";

import type { ProfileStore } from "./types";

const logger = createLocalLogger("profilePage");

const useProfileStore = create<ProfileStore>()((set) => ({
  apiKeys: [],
  isLoadingApiKeys: true,
  loadApiKeys: async () => {
    try {
      set({ apiKeys: await listApiKeys() });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar as chaves de API"));
    } finally {
      set({ isLoadingApiKeys: false });
    }
  }
}));

export default useProfileStore;
