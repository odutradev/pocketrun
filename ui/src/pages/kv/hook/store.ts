import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { listApplications } from "@actions/apps";

import type { KvStore } from "./types";

const logger = createLocalLogger("kvPage");

const useKvStore = create<KvStore>()((set) => ({
  applications: [],
  isLoading: true,
  loadApplications: async () => {
    set({ isLoading: true });
    try {
      set({ applications: await listApplications() });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar as aplicações"));
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useKvStore;
