import { useMatch, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { linksPageSize } from "@assets/config";
import { linkGroupTabs } from "@assets/data";
import useLinksStore from "./store";

import type { Link, LinkGroupTab, LinkGroupTotals } from "@utils/types/link";
import type { UseLinksPageReturn } from "./types";

const matchesSearch = (link: Link, search: string) => {
  const term = search.toLowerCase();
  return [link.title, link.slug, link.url].some((value) => value.toLowerCase().includes(term));
};

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
    localSearch,
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
  const visibleLinks = localSearch ? links.filter((link) => matchesSearch(link, localSearch)) : links;
  const visibleTotal = localSearch ? visibleLinks.length : total;

  return {
    view,
    links: visibleLinks,
    total: visibleTotal,
    scopeTotal: scope ? (findTotals(summary.groups, scope)?.links ?? 0) : summary.ungrouped,
    page: loadedQuery?.page ?? 1,
    totalPages: Math.max(1, Math.ceil(visibleTotal / linksPageSize)),
    search: query?.scope === scope ? query.search || localSearch : "",
    state: query?.state ?? "all",
    sort: query?.sort ?? "recent",
    transitionKey: loadedQuery
      ? [loadedQuery.scope, loadedQuery.search, localSearch, loadedQuery.state, loadedQuery.sort, loadedQuery.page].join("|")
      : "",
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
    isSearching: Boolean(loadedQuery?.search || localSearch),
    isFiltered: Boolean(loadedQuery?.search || localSearch) || (loadedQuery?.state ?? "all") !== "all",
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
