import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { getLinkSummary, listLinkGroups, listLinks } from "@actions/links";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { linksPageSize } from "@assets/config";

import type { LinksListQuery, LinksStore } from "./types";
import type { LinkListParams } from "@utils/types/link";

const logger = createLocalLogger("linksPage");

const toListParams = ({ scope, search, page }: LinksListQuery): LinkListParams => ({
  groupId: scope || "none",
  search: search || undefined,
  page,
  limit: linksPageSize
});

const useLinksStore = create<LinksStore>()(
  persist(
    (set, get) => ({
      view: "list",
      groups: [],
      summary: { total: 0, ungrouped: 0, groups: [] },
      links: [],
      total: 0,
      query: null,
      loadedQuery: null,
      localSearch: "",
      emptySearchCache: null,
      hasLoaded: false,
      isLoading: true,
      isRefreshing: false,
      isListLoading: false,
      isSearchLoading: false,
      listRequestId: 0,
      isGroupsOpen: false,
      removeTarget: null,
      loadOverview: async () => {
        set(get().hasLoaded ? { isRefreshing: true } : { isLoading: true });
        try {
          const [groups, summary] = await Promise.all([listLinkGroups(), getLinkSummary()]);
          set({ groups, summary, hasLoaded: true });
        } catch (error) {
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar os links"));
        } finally {
          set({ isLoading: false, isRefreshing: false });
        }
      },
      loadList: async (query) => {
        const { loadedQuery, listRequestId: previousRequestId } = get();
        const listRequestId = previousRequestId + 1;
        const isSearchChange = loadedQuery !== null && loadedQuery.scope === query.scope && loadedQuery.search !== query.search;
        set({ query, listRequestId, isListLoading: true, isSearchLoading: isSearchChange });
        try {
          const result = await listLinks(toListParams(query));
          if (get().listRequestId !== listRequestId) return;
          if (result.data.length === 0 && result.totalPages > 0 && query.page > result.totalPages) {
            get().loadList({ ...query, page: result.totalPages });
            return;
          }
          set({ links: result.data, total: result.total, loadedQuery: query });
          if (!query.search) set({ emptySearchCache: { query, links: result.data, total: result.total } });
          const { localSearch } = get();
          if (localSearch && !query.search && result.total > linksPageSize) {
            set({ localSearch: "" });
            get().loadList({ ...query, search: localSearch, page: 1 });
          }
        } catch (error) {
          if (get().listRequestId !== listRequestId) return;
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar os links"));
        } finally {
          if (get().listRequestId === listRequestId) set({ isListLoading: false, isSearchLoading: false });
        }
      },
      loadLinks: async () => {
        const { query, loadOverview, loadList } = get();
        set({ emptySearchCache: null });
        await Promise.all([loadOverview(), query ? loadList(query) : Promise.resolve()]);
      },
      openScope: async (scope) => {
        const { query, loadList } = get();
        if (query?.scope === scope) return;
        set({ localSearch: "" });
        await loadList({ scope, search: "", page: 1 });
      },
      searchLinks: async (search) => {
        const { query, loadedQuery, total, emptySearchCache, listRequestId, loadList } = get();
        if (!query) return;
        const isWholeScopeLoaded =
          loadedQuery !== null && loadedQuery.scope === query.scope && !loadedQuery.search && total <= linksPageSize;
        if (isWholeScopeLoaded) {
          set({ localSearch: search });
          return;
        }
        set({ localSearch: "" });
        if (!search && emptySearchCache?.query.scope === query.scope) {
          set({
            query: emptySearchCache.query,
            loadedQuery: emptySearchCache.query,
            links: emptySearchCache.links,
            total: emptySearchCache.total,
            listRequestId: listRequestId + 1,
            isListLoading: false,
            isSearchLoading: false
          });
          return;
        }
        await loadList({ ...query, search, page: 1 });
      },
      goToPage: async (page) => {
        const { query, loadList } = get();
        if (!query) return;
        await loadList({ ...query, page });
      },
      setGroupsOpen: (isGroupsOpen) => set({ isGroupsOpen }),
      setRemoveTarget: (removeTarget) => set({ removeTarget }),
      setView: (view) => set({ view })
    }),
    { name: "links-page", partialize: (state) => ({ view: state.view }) }
  )
);

export default useLinksStore;
