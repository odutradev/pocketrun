import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { listApplications } from "@actions/apps";

import type { KvStore } from "./types";

const logger = createLocalLogger("kvPage");

const useKvStore = create<KvStore>()(
  persist(
    (set, get) => ({
      view: "list",
      applications: [],
      hasLoaded: false,
      isLoading: true,
      isRefreshing: false,
      search: "",
      filter: "all",
      sort: "recent",
      page: 1,
      removeTarget: null,
      loadApplications: async () => {
        set(get().hasLoaded ? { isRefreshing: true } : { isLoading: true });
        try {
          set({ applications: await listApplications(), hasLoaded: true });
        } catch (error) {
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar as aplicações"));
        } finally {
          set({ isLoading: false, isRefreshing: false });
        }
      },
      setSearch: (search) => set({ search, page: 1 }),
      setFilter: (filter) => set({ filter, page: 1 }),
      setSort: (sort) => set({ sort, page: 1 }),
      setPage: (page) => set({ page }),
      setView: (view) => set({ view }),
      setRemoveTarget: (removeTarget) => set({ removeTarget })
    }),
    { name: "kv-page", partialize: (state) => ({ view: state.view }) }
  )
);

export default useKvStore;
