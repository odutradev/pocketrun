import { matchesApplicationFilters, sortApplications } from "@utils/functions";
import { applicationsPageSize } from "@assets/config";
import useKvStore from "./store";

import type { UseKvPageReturn } from "./types";

const useKvPage = (): UseKvPageReturn => {
  const {
    view,
    applications,
    hasLoaded,
    isLoading,
    isRefreshing,
    search,
    filter,
    sort,
    page,
    removeTarget,
    loadApplications,
    setSearch,
    setFilter,
    setSort,
    setPage,
    setView,
    setRemoveTarget
  } = useKvStore();

  const visible = sortApplications(
    applications.filter((application) => matchesApplicationFilters(application, search, filter)),
    sort
  );
  const totalPages = Math.max(1, Math.ceil(visible.length / applicationsPageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * applicationsPageSize;

  return {
    view,
    applications: visible.slice(start, start + applicationsPageSize),
    total: visible.length,
    scopeTotal: applications.length,
    page: currentPage,
    totalPages,
    search,
    filter,
    sort,
    transitionKey: [search, filter, sort, currentPage].join("|"),
    hasNoApplications: hasLoaded && applications.length === 0,
    isFiltered: Boolean(search.trim()) || filter !== "all",
    isLoading,
    isRefreshing,
    removeTarget,
    loadApplications,
    handleSearch: setSearch,
    handleFilterChange: setFilter,
    handleSortChange: setSort,
    handlePageChange: setPage,
    handleViewChange: setView,
    handleOpenRemove: setRemoveTarget,
    handleCloseRemove: () => setRemoveTarget(null)
  };
};

export default useKvPage;
