import { useMatch, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { currentTimestamp, matchesLinkFilters, sortLinksBy } from "@utils/functions";
import { linksPageSize } from "@assets/config";
import { linkGroupTabs } from "@assets/data";
import useLinksStore from "./store";

import type { LinkGroupTab, LinkGroupTotals } from "@utils/types/link";
import type { UseLinksPageReturn } from "./types";

const findTotals = (totals: LinkGroupTotals[], groupId: string) => totals.find((item) => item.groupId === groupId);

const toGroupTab = (value: string | null): LinkGroupTab => linkGroupTabs.find((tab) => tab.value === value)?.value ?? "links";

const useLinksPage = (): UseLinksPageReturn => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreatingGroup = useMatch("/links/groups/new") !== null;
  const {
    view,
    groups,
    summary,
    links,
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
    loadLinks,
    openScope,
    searchLinks,
    goToPage,
    filterLinks,
    sortLinks,
    addGroup,
    replaceGroup,
    removeGroup,
    setRemoveTarget,
    setView
  } = useLinksStore();

  const scope = groupId ?? "";
  const activeGroup = groups.find((group) => group.id === scope) ?? null;
  const localQuery = isWholeScopeLoaded && query && loadedQuery?.scope === query.scope ? query : null;
  const listing = localQuery ?? loadedQuery;
  const visibleLinks = localQuery
    ? sortLinksBy(
        links.filter((link) => matchesLinkFilters(link, localQuery.search, localQuery.state)),
        localQuery.sort,
        currentTimestamp()
      )
    : links;
  const visibleTotal = localQuery ? visibleLinks.length : total;
  const isSearching = Boolean(listing?.search);

  return {
    view,
    links: visibleLinks,
    total: visibleTotal,
    scopeTotal: scope ? (findTotals(summary.groups, scope)?.links ?? 0) : summary.ungrouped,
    page: localQuery ? 1 : (loadedQuery?.page ?? 1),
    totalPages: Math.max(1, Math.ceil(visibleTotal / linksPageSize)),
    search: query?.scope === scope ? query.search : "",
    state: query?.state ?? "all",
    sort: query?.sort ?? "recent",
    transitionKey: listing ? [listing.scope, listing.search, listing.state, listing.sort, localQuery ? 1 : listing.page].join("|") : "",
    groups,
    groupSummaries: groups.map((group) => ({
      group,
      linkCount: findTotals(summary.groups, group.id)?.links ?? 0,
      clicks: findTotals(summary.groups, group.id)?.clicks ?? 0
    })),
    activeGroup,
    scope,
    tab: toGroupTab(searchParams.get("tab")),
    isCreatingGroup,
    hasNoLinks: hasLoaded && summary.total === 0 && groups.length === 0,
    isGroupMissing: scope !== "" && hasLoaded && activeGroup === null && !isRefreshing,
    isSearching,
    isFiltered: isSearching || (listing?.state ?? "all") !== "all",
    isLoading,
    isRefreshing,
    isScopePending: loadedQuery?.scope !== scope,
    isListLoading,
    isSearchLoading,
    removeTarget,
    loadLinks,
    openScope,
    handleSearch: (search) => {
      searchLinks(search);
    },
    handlePageChange: (page) => {
      goToPage(page);
    },
    handleStateChange: (state) => {
      filterLinks(state);
    },
    handleSortChange: (sort) => {
      sortLinks(sort);
    },
    handleTabChange: (next) => setSearchParams(next === "links" ? {} : { tab: next }, { replace: true }),
    handleGroupCreated: (group) => {
      addGroup(group);
      navigate(`/links/groups/${group.id}`, { replace: true });
    },
    handleGroupSaved: replaceGroup,
    handleGroupRemoved: (removedId) => {
      navigate("/links", { replace: true });
      removeGroup(removedId);
    },
    handleOpenRemove: setRemoveTarget,
    handleCloseRemove: () => setRemoveTarget(null),
    handleViewChange: setView
  };
};

export default useLinksPage;
