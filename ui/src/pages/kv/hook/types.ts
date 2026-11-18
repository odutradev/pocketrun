import type { Application, ApplicationFilter, ApplicationSort } from "@utils/types/application";
import type { LinksView } from "@utils/types/sitePage";

export interface UseKvPageReturn {
  view: LinksView;
  applications: Application[];
  total: number;
  scopeTotal: number;
  page: number;
  totalPages: number;
  search: string;
  filter: ApplicationFilter;
  sort: ApplicationSort;
  transitionKey: string;
  hasNoApplications: boolean;
  isFiltered: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  removeTarget: Application | null;
  loadApplications: () => Promise<void>;
  handleSearch: (search: string) => void;
  handleFilterChange: (filter: ApplicationFilter) => void;
  handleSortChange: (sort: ApplicationSort) => void;
  handlePageChange: (page: number) => void;
  handleViewChange: (view: LinksView) => void;
  handleOpenRemove: (application: Application) => void;
  handleCloseRemove: () => void;
}

export interface KvStore {
  view: LinksView;
  applications: Application[];
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  search: string;
  filter: ApplicationFilter;
  sort: ApplicationSort;
  page: number;
  removeTarget: Application | null;
  loadApplications: () => Promise<void>;
  setSearch: (search: string) => void;
  setFilter: (filter: ApplicationFilter) => void;
  setSort: (sort: ApplicationSort) => void;
  setPage: (page: number) => void;
  setView: (view: LinksView) => void;
  setRemoveTarget: (application: Application | null) => void;
}
