import type { SitePage, PageGroup, PageGroupTab, LinkSort, LinkStateFilter, PageSummary, LinksView } from "@utils/types/sitePage";

export interface PageGroupSummary {
  group: PageGroup;
  pageCount: number;
  clicks: number;
}

export interface PagesListQuery {
  scope: string;
  search: string;
  state: LinkStateFilter;
  sort: LinkSort;
  page: number;
}

export interface PagesListCache {
  query: PagesListQuery;
  sitePages: SitePage[];
  total: number;
}

export interface UsePagesPageReturn {
  view: LinksView;
  sitePages: SitePage[];
  total: number;
  scopeTotal: number;
  page: number;
  totalPages: number;
  search: string;
  state: LinkStateFilter;
  sort: LinkSort;
  transitionKey: string;
  groups: PageGroup[];
  groupSummaries: PageGroupSummary[];
  activeGroup: PageGroup | null;
  scope: string;
  tab: PageGroupTab;
  isCreatingGroup: boolean;
  hasNoPages: boolean;
  isGroupMissing: boolean;
  isSearching: boolean;
  isFiltered: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isScopePending: boolean;
  isListLoading: boolean;
  isSearchLoading: boolean;
  removeTarget: SitePage | null;
  loadPages: () => Promise<void>;
  openScope: (scope: string) => Promise<void>;
  handleSearch: (search: string) => void;
  handlePageChange: (page: number) => void;
  handleStateChange: (state: LinkStateFilter) => void;
  handleSortChange: (sort: LinkSort) => void;
  handleTabChange: (tab: PageGroupTab) => void;
  handleGroupCreated: (group: PageGroup) => void;
  handleGroupSaved: (group: PageGroup) => void;
  handleGroupRemoved: (groupId: string) => void;
  handleOpenRemove: (sitePage: SitePage) => void;
  handleCloseRemove: () => void;
  handleViewChange: (view: LinksView) => void;
}

export interface PagesStore {
  view: LinksView;
  groups: PageGroup[];
  summary: PageSummary;
  sitePages: SitePage[];
  total: number;
  query: PagesListQuery | null;
  loadedQuery: PagesListQuery | null;
  isWholeScopeLoaded: boolean;
  emptySearchCache: PagesListCache | null;
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isListLoading: boolean;
  isSearchLoading: boolean;
  listRequestId: number;
  removeTarget: SitePage | null;
  loadOverview: () => Promise<void>;
  loadList: (request: PagesListQuery) => Promise<void>;
  applyQuery: (query: PagesListQuery) => Promise<void>;
  loadPages: () => Promise<void>;
  openScope: (scope: string) => Promise<void>;
  searchPages: (search: string) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  filterPages: (state: LinkStateFilter) => Promise<void>;
  sortPages: (sort: LinkSort) => Promise<void>;
  addGroup: (group: PageGroup) => void;
  replaceGroup: (group: PageGroup) => void;
  removeGroup: (groupId: string) => Promise<void>;
  setRemoveTarget: (sitePage: SitePage | null) => void;
  setView: (view: LinksView) => void;
}
