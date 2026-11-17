import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { listApplications } from "@actions/apps";

import type { Application } from "@utils/types/application";

const logger = createLocalLogger("homePage");

interface HomeStore {
  applications: Application[];
  isLoading: boolean;
  isRefreshing: boolean;
  search: string;
  isCreateModalOpen: boolean;
  loadApplications: () => Promise<void>;
  setSearch: (search: string) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
}

const useHomeStore = create<HomeStore>()((set, get) => ({
  applications: [],
  isLoading: true,
  isRefreshing: false,
  search: "",
  isCreateModalOpen: false,
  loadApplications: async () => {
    const isFirstLoad = get().applications.length === 0;
    set(isFirstLoad ? { isLoading: true } : { isRefreshing: true });
    try {
      set({ applications: await listApplications() });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar as aplicações"));
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },
  setSearch: (search) => set({ search }),
  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen })
}));

export default useHomeStore;
