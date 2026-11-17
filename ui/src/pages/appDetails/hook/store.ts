import { toast } from "react-toastify";
import { create } from "zustand";

import { getApplication } from "@actions/apps";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import type { Application } from "@utils/types/application";

import type { DetailsTab } from "./types";

const logger = createLocalLogger("appDetailsPage");

interface AppDetailsStore {
  application: Application | null;
  isLoading: boolean;
  activeTab: DetailsTab;
  isTokenModalOpen: boolean;
  loadApplication: (applicationId: string, signal?: AbortSignal) => Promise<void>;
  setActiveTab: (tab: DetailsTab) => void;
  setTokenModalOpen: (isOpen: boolean) => void;
  reset: () => void;
}

const initialState = {
  application: null,
  isLoading: true,
  activeTab: "explorer" as DetailsTab,
  isTokenModalOpen: false
};

const useAppDetailsStore = create<AppDetailsStore>()((set) => ({
  ...initialState,
  loadApplication: async (applicationId, signal) => {
    try {
      set({ application: await getApplication(applicationId, signal), isLoading: false });
    } catch (error) {
      if (signal?.aborted) return;
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar a aplicação"));
      set({ isLoading: false });
    }
  },
  setActiveTab: (activeTab) => set({ activeTab }),
  setTokenModalOpen: (isTokenModalOpen) => set({ isTokenModalOpen }),
  reset: () => set(initialState)
}));

export default useAppDetailsStore;
