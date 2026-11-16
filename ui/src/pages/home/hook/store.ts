import { toast } from "react-toastify";
import { create } from "zustand";

import { listApplications } from "@actions/apps";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import type { Application } from "@utils/types/application";

const logger = createLocalLogger("homePage");

interface HomeStore {
  applications: Application[];
  isLoading: boolean;
  isCreateModalOpen: boolean;
  isAuthModalOpen: boolean;
  loadApplications: () => Promise<void>;
  setCreateModalOpen: (isOpen: boolean) => void;
  setAuthModalOpen: (isOpen: boolean) => void;
}

const useHomeStore = create<HomeStore>()((set) => ({
  applications: [],
  isLoading: true,
  isCreateModalOpen: false,
  isAuthModalOpen: false,
  loadApplications: async () => {
    set({ isLoading: true });
    try {
      set({ applications: await listApplications() });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Falha ao carregar aplicações"));
    } finally {
      set({ isLoading: false });
    }
  },
  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen })
}));

export default useHomeStore;
