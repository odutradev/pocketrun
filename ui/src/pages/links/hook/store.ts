import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { listLinkGroups, listLinks } from "@actions/links";

import type { LinksStore } from "./types";

const logger = createLocalLogger("linksPage");

const useLinksStore = create<LinksStore>()((set, get) => ({
  links: [],
  groups: [],
  isLoading: true,
  isRefreshing: false,
  search: "",
  groupFilter: "all",
  isGroupsOpen: false,
  removeTarget: null,
  loadLinks: async () => {
    const isFirstLoad = get().links.length === 0 && get().groups.length === 0;
    set(isFirstLoad ? { isLoading: true } : { isRefreshing: true });
    try {
      const [links, groups] = await Promise.all([listLinks(), listLinkGroups()]);
      const { groupFilter } = get();
      const isKnownFilter =
        groupFilter === "all" || groupFilter === "none" || groups.some((group) => group.id === groupFilter);
      set({ links, groups, groupFilter: isKnownFilter ? groupFilter : "all" });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar os links"));
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },
  setSearch: (search) => set({ search }),
  setGroupFilter: (groupFilter) => set({ groupFilter }),
  setGroupsOpen: (isGroupsOpen) => set({ isGroupsOpen }),
  setRemoveTarget: (removeTarget) => set({ removeTarget })
}));

export default useLinksStore;
