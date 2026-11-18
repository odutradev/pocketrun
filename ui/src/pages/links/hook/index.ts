import { useSearchParams } from "react-router-dom";

import { linksPageSize } from "@assets/config";
import useLinksStore from "./store";

import type { LinkGroupTotals } from "@utils/types/link";
import type { UseLinksPageReturn } from "./types";

const findTotals = (totals: LinkGroupTotals[], groupId: string) => totals.find((item) => item.groupId === groupId);

const useLinksPage = (): UseLinksPageReturn => {
  const [searchParams] = useSearchParams();
  const {
    view,
    groups,
    summary,
    links,
    total,
    query,
    loadedQuery,
    hasLoaded,
    isLoading,
    isRefreshing,
    isListLoading,
    isSearchLoading,
    isGroupsOpen,
    removeTarget,
    loadLinks,
    openScope,
    searchLinks,
    goToPage,
    setGroupsOpen,
    setRemoveTarget,
    setView
  } = useLinksStore();

  const scope = searchParams.get("group") ?? "";
  const activeGroup = groups.find((group) => group.id === scope) ?? null;

  return {
    view,
    links,
    total,
    page: loadedQuery?.page ?? 1,
    totalPages: Math.max(1, Math.ceil(total / linksPageSize)),
    search: query?.scope === scope ? query.search : "",
    transitionKey: loadedQuery ? `${loadedQuery.scope}|${loadedQuery.search}|${loadedQuery.page}` : "",
    groups,
    groupSummaries: groups.map((group) => ({
      group,
      linkCount: findTotals(summary.groups, group.id)?.links ?? 0,
      clicks: findTotals(summary.groups, group.id)?.clicks ?? 0
    })),
    activeGroup,
    scope,
    hasNoLinks: hasLoaded && summary.total === 0 && groups.length === 0,
    isGroupMissing: scope !== "" && hasLoaded && activeGroup === null && !isRefreshing,
    isSearching: Boolean(loadedQuery?.search),
    isLoading,
    isRefreshing,
    isScopePending: loadedQuery?.scope !== scope,
    isListLoading,
    isSearchLoading,
    isGroupsOpen,
    removeTarget,
    loadLinks,
    openScope,
    handleSearch: (search) => {
      searchLinks(search);
    },
    handlePageChange: (page) => {
      goToPage(page);
    },
    handleOpenGroups: () => setGroupsOpen(true),
    handleCloseGroups: () => setGroupsOpen(false),
    handleOpenRemove: setRemoveTarget,
    handleCloseRemove: () => setRemoveTarget(null),
    handleViewChange: setView
  };
};

export default useLinksPage;
