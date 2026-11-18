import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { listLinkGroups, listLinks } from "@actions/links";

import type { LinksStore } from "./types";

const logger = createLocalLogger("linksPage");

const useLinksStore = create<LinksStore>()(
  persist(
    (set, get) => ({
      view: "list",
      links: [],
      groups: [],
      isLoading: true,
      isRefreshing: false,
      search: "",
      isGroupsOpen: false,
      removeTarget: null,
      loadLinks: async () => {
        const isFirstLoad = get().links.length === 0 && get().groups.length === 0;
        set(isFirstLoad ? { isLoading: true } : { isRefreshing: true });
        try {
          const [links, groups] = await Promise.all([listLinks(), listLinkGroups()]);
          set({ links, groups });
        } catch (error) {
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar os links"));
        } finally {
          set({ isLoading: false, isRefreshing: false });
        }
      },
      setSearch: (search) => set({ search }),
      setGroupsOpen: (isGroupsOpen) => set({ isGroupsOpen }),
      setRemoveTarget: (removeTarget) => set({ removeTarget }),
      setView: (view) => set({ view })
    }),
    { name: "links-page", partialize: (state) => ({ view: state.view }) }
  )
);

export default useLinksStore;
