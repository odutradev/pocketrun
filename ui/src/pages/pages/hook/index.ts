import { useMatch, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { currentTimestamp, matchesPageFilters, sortListBy } from "@utils/functions";
import { pagesPageSize } from "@assets/config";
import { pageGroupTabs } from "@assets/data";
import usePagesStore from "./store";

import type { PageGroupTab, PageGroupTotals } from "@utils/types/sitePage";
import type { UsePagesPageReturn } from "./types";

const findTotals = (totals: PageGroupTotals[], groupId: string) => totals.find((item) => item.groupId === groupId);

const toGroupTab = (value: string | null): PageGroupTab => pageGroupTabs.find((tab) => tab.value === value)?.value ?? "pages";

const usePagesPage = (): UsePagesPageReturn => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreatingGroup = useMatch("/pages/groups/new") !== null;
  const {
    view,
    groups,
    summary,
    sitePages,
    total,
    query,
    loadedQuery,
    isWholeScopeLoaded,
    hasLoaded,
    isLoading,
    isRefreshing,
    isListLoading,
    isSearchLoading,
    removeTarget,
    loadPages,
    openScope,
    searchPages,
    goToPage,
    filterPages,
    sortPages,
    addGroup,
    replaceGroup,
    removeGroup,
    setRemoveTarget,
    setView
  } = usePagesStore();

  const scope = groupId ?? "";
  const activeGroup = groups.find((group) => group.id === scope) ?? null;
  const localQuery = isWholeScopeLoaded && query && loadedQuery?.scope === query.scope ? query : null;
  const listing = localQuery ?? loadedQuery;
  const visiblePages = localQuery
    ? sortListBy(
        sitePages.filter((sitePage) => matchesPageFilters(sitePage, localQuery.search, localQuery.state)),
        localQuery.sort,
        currentTimestamp()
      )
    : sitePages;
  const visibleTotal = localQuery ? visiblePages.length : total;
  const isSearching = Boolean(listing?.search);

  return {
    view,
    sitePages: visiblePages,
    total: visibleTotal,
    scopeTotal: scope ? (findTotals(summary.groups, scope)?.pages ?? 0) : summary.ungrouped,
    page: localQuery ? 1 : (loadedQuery?.page ?? 1),
    totalPages: Math.max(1, Math.ceil(visibleTotal / pagesPageSize)),
    search: query?.scope === scope ? query.search : "",
    state: query?.state ?? "all",
    sort: query?.sort ?? "recent",
    transitionKey: listing ? [listing.scope, listing.search, listing.state, listing.sort, localQuery ? 1 : listing.page].join("|") : "",
    groups,
    groupSummaries: groups.map((group) => ({
      group,
      pageCount: findTotals(summary.groups, group.id)?.pages ?? 0,
      clicks: findTotals(summary.groups, group.id)?.clicks ?? 0
    })),
    activeGroup,
    scope,
    tab: toGroupTab(searchParams.get("tab")),
    isCreatingGroup,
    hasNoPages: hasLoaded && summary.total === 0 && groups.length === 0,
    isGroupMissing: scope !== "" && hasLoaded && activeGroup === null && !isRefreshing,
    isSearching,
    isFiltered: isSearching || (listing?.state ?? "all") !== "all",
    isLoading,
    isRefreshing,
    isScopePending: loadedQuery?.scope !== scope,
    isListLoading,
    isSearchLoading,
    removeTarget,
    loadPages,
    openScope,
    handleSearch: (search) => {
      searchPages(search);
    },
    handlePageChange: (page) => {
      goToPage(page);
    },
    handleStateChange: (state) => {
      filterPages(state);
    },
    handleSortChange: (sort) => {
      sortPages(sort);
    },
    handleTabChange: (next) => setSearchParams(next === "pages" ? {} : { tab: next }, { replace: true }),
    handleGroupCreated: (group) => {
      addGroup(group);
      navigate(`/pages/groups/${group.id}`, { replace: true });
    },
    handleGroupSaved: replaceGroup,
    handleGroupRemoved: (removedId) => {
      navigate("/pages", { replace: true });
      removeGroup(removedId);
    },
    handleOpenRemove: setRemoveTarget,
    handleCloseRemove: () => setRemoveTarget(null),
    handleViewChange: setView
  };
};

export default usePagesPage;
