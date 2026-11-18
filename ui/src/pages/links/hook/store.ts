import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { getLinkSummary, listLinkGroups, listLinks } from "@actions/links";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { linksPageSize } from "@assets/config";

import type { LinkGroup, LinkListParams } from "@utils/types/link";
import type { LinksListQuery, LinksStore } from "./types";

const logger = createLocalLogger("linksPage");

const toListParams = ({ scope, search, state, sort, page }: LinksListQuery): LinkListParams => ({
  groupId: scope || "none",
  search: search || undefined,
  state: state === "all" ? undefined : state,
  sort: sort === "recent" ? undefined : sort,
  page,
  limit: linksPageSize
});

const isSameListing = (first: LinksListQuery, second: LinksListQuery) =>
  first.scope === second.scope && first.state === second.state && first.sort === second.sort;

const sortGroups = (groups: LinkGroup[]) => [...groups].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

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
        const isSearchChange = loadedQuery !== null && isSameListing(loadedQuery, query) && loadedQuery.search !== query.search;
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
        await loadList({ scope, search: "", state: query?.state ?? "all", sort: query?.sort ?? "recent", page: 1 });
      },
      searchLinks: async (search) => {
        const { query, loadedQuery, total, emptySearchCache, listRequestId, loadList } = get();
        if (!query) return;
        const isWholeScopeLoaded = loadedQuery !== null && isSameListing(loadedQuery, query) && !loadedQuery.search && total <= linksPageSize;
        if (isWholeScopeLoaded) {
          set({ localSearch: search });
          return;
        }
        set({ localSearch: "" });
        if (!search && emptySearchCache && isSameListing(emptySearchCache.query, query)) {
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
      filterLinks: async (state) => {
        const { query, loadList } = get();
        if (!query || query.state === state) return;
        await loadList({ ...query, state, page: 1 });
      },
      sortLinks: async (sort) => {
        const { query, loadList } = get();
        if (!query || query.sort === sort) return;
        await loadList({ ...query, sort, page: 1 });
      },
      addGroup: (group) => set((state) => ({ groups: sortGroups([...state.groups, group]) })),
      replaceGroup: (group) =>
        set((state) => ({ groups: sortGroups(state.groups.map((item) => (item.id === group.id ? group : item))) })),
      removeGroup: async (groupId) => {
        set((state) => ({ groups: state.groups.filter((group) => group.id !== groupId), emptySearchCache: null }));
        await get().loadOverview();
      },
      setRemoveTarget: (removeTarget) => set({ removeTarget }),
      setView: (view) => set({ view })
    }),
    { name: "links-page", partialize: (state) => ({ view: state.view }) }
  )
);

export default useLinksStore;
