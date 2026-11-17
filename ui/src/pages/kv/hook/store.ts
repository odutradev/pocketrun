import { toast } from "react-toastify";
import { create } from "zustand";

import { listApplications } from "@actions/apps";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import type { Application } from "@utils/types/application";

const logger = createLocalLogger("kvPage");

interface KvStore {
  applications: Application[];
  isLoading: boolean;
  loadApplications: () => Promise<void>;
}

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
