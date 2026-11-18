import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { getPageSummary, listPageGroups, listPages } from "@actions/sitePages";
import { createLocalLogger, getErrorMessage, holdsWholeList } from "@utils/functions";
import { pagesPageSize } from "@assets/config";

import type { PageGroup, PageListParams } from "@utils/types/sitePage";
import type { PagesListQuery, PagesStore } from "./types";

const logger = createLocalLogger("pagesPage");

const toListParams = ({ scope, search, state, sort, page }: PagesListQuery): PageListParams => ({
  groupId: scope || "none",
  search: search || undefined,
  state: state === "all" ? undefined : state,
  sort: sort === "recent" ? undefined : sort,
  page,
  limit: pagesPageSize
});

const isSameListing = (first: PagesListQuery, second: PagesListQuery) =>
  first.scope === second.scope && first.state === second.state && first.sort === second.sort;

const isSameRequest = (first: PagesListQuery, second: PagesListQuery) =>
  isSameListing(first, second) && first.search === second.search && first.page === second.page;

const isScopeQuery = (query: PagesListQuery) => Boolean(query.search) || query.state !== "all";

const sortGroups = (groups: PageGroup[]) => [...groups].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const usePagesStore = create<PagesStore>()(
  persist(
    (set, get) => ({
      view: "list",
      groups: [],
      summary: { total: 0, ungrouped: 0, groups: [] },
      sitePages: [],
      total: 0,
      query: null,
      loadedQuery: null,
      isWholeScopeLoaded: false,
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
          const [groups, summary] = await Promise.all([listPageGroups(), getPageSummary()]);
          set({ groups, summary, hasLoaded: true });
        } catch (error) {
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar as páginas"));
        } finally {
          set({ isLoading: false, isRefreshing: false });
        }
      },
      loadList: async (request) => {
        const { loadedQuery, listRequestId: previousRequestId } = get();
        const listRequestId = previousRequestId + 1;
        const isSearchChange = loadedQuery !== null && isSameListing(loadedQuery, request) && loadedQuery.search !== request.search;
        set({ listRequestId, isListLoading: true, isSearchLoading: isSearchChange });
        try {
          const result = await listPages(toListParams(request));
          if (get().listRequestId !== listRequestId) return;
          if (result.data.length === 0 && result.totalPages > 0 && request.page > result.totalPages) {
            const lastPage = { ...request, page: result.totalPages };
            if (get().query === request) set({ query: lastPage });
            get().loadList(lastPage);
            return;
          }
          const isWholeScopeLoaded = holdsWholeList(result.total, pagesPageSize, isScopeQuery(request));
          set({ sitePages: result.data, total: result.total, loadedQuery: request, isWholeScopeLoaded });
          if (!request.search) set({ emptySearchCache: { query: request, sitePages: result.data, total: result.total } });
          const { query } = get();
          if (query && query !== request && query.scope === request.scope && !isWholeScopeLoaded) get().loadList(query);
        } catch (error) {
          if (get().listRequestId !== listRequestId) return;
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar as páginas"));
        } finally {
          if (get().listRequestId === listRequestId) set({ isListLoading: false, isSearchLoading: false });
        }
      },
      applyQuery: async (next) => {
        const { query, loadedQuery, isWholeScopeLoaded, emptySearchCache, listRequestId, loadList } = get();
        if (isWholeScopeLoaded && loadedQuery?.scope === next.scope) {
          const isOtherScopeLoading = query !== null && query.scope !== next.scope;
          set({
            query: next,
            ...(isOtherScopeLoading && { listRequestId: listRequestId + 1, isListLoading: false, isSearchLoading: false })
          });
          return;
        }
        if (emptySearchCache && isSameRequest(emptySearchCache.query, next)) {
          set({
            query: emptySearchCache.query,
            loadedQuery: emptySearchCache.query,
            sitePages: emptySearchCache.sitePages,
            total: emptySearchCache.total,
            isWholeScopeLoaded: holdsWholeList(emptySearchCache.total, pagesPageSize, isScopeQuery(emptySearchCache.query)),
            listRequestId: listRequestId + 1,
            isListLoading: false,
            isSearchLoading: false
          });
          return;
        }
        set({ query: next });
        await loadList(next);
      },
      loadPages: async () => {
        const { query, loadedQuery, isWholeScopeLoaded, loadOverview, loadList } = get();
        set({ emptySearchCache: null });
        const isLocal = query !== null && isWholeScopeLoaded && loadedQuery?.scope === query.scope;
        const request = query && isLocal ? { ...query, search: "", state: "all" as const, page: 1 } : query;
        await Promise.all([loadOverview(), request ? loadList(request) : Promise.resolve()]);
      },
      openScope: async (scope) => {
        const { query, applyQuery } = get();
        if (query?.scope === scope) return;
        await applyQuery({ scope, search: "", state: query?.state ?? "all", sort: query?.sort ?? "recent", page: 1 });
      },
      searchPages: async (search) => {
        const { query, applyQuery } = get();
        if (!query || query.search === search) return;
        await applyQuery({ ...query, search, page: 1 });
      },
      goToPage: async (page) => {
        const { query, applyQuery } = get();
        if (!query) return;
        await applyQuery({ ...query, page });
      },
      filterPages: async (state) => {
        const { query, applyQuery } = get();
        if (!query || query.state === state) return;
        await applyQuery({ ...query, state, page: 1 });
      },
      sortPages: async (sort) => {
        const { query, applyQuery } = get();
        if (!query || query.sort === sort) return;
        await applyQuery({ ...query, sort, page: 1 });
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
    { name: "pages-page", partialize: (state) => ({ view: state.view }) }
  )
);

export default usePagesStore;
