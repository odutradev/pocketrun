import type { Link, LinkGroup, LinkGroupTab, LinkSort, LinkStateFilter, LinkSummary, LinksView } from "@utils/types/link";

export interface LinkGroupSummary {
  group: LinkGroup;
  linkCount: number;
  clicks: number;
}

export interface LinksListQuery {
  scope: string;
  search: string;
  state: LinkStateFilter;
  sort: LinkSort;
  page: number;
}

export interface LinksListCache {
  query: LinksListQuery;
  links: Link[];
  total: number;
}

export interface UseLinksPageReturn {
  view: LinksView;
  links: Link[];
  total: number;
  scopeTotal: number;
  page: number;
  totalPages: number;
  search: string;
  state: LinkStateFilter;
  sort: LinkSort;
  transitionKey: string;
  groups: LinkGroup[];
  groupSummaries: LinkGroupSummary[];
  activeGroup: LinkGroup | null;
  scope: string;
  tab: LinkGroupTab;
  isCreatingGroup: boolean;
  hasNoLinks: boolean;
  isGroupMissing: boolean;
  isSearching: boolean;
  isFiltered: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isScopePending: boolean;
  isListLoading: boolean;
  isSearchLoading: boolean;
  removeTarget: Link | null;
  loadLinks: () => Promise<void>;
  openScope: (scope: string) => Promise<void>;
  handleSearch: (search: string) => void;
  handlePageChange: (page: number) => void;
  handleStateChange: (state: LinkStateFilter) => void;
  handleSortChange: (sort: LinkSort) => void;
  handleTabChange: (tab: LinkGroupTab) => void;
  handleGroupCreated: (group: LinkGroup) => void;
  handleGroupSaved: (group: LinkGroup) => void;
  handleGroupRemoved: (groupId: string) => void;
  handleOpenRemove: (link: Link) => void;
  handleCloseRemove: () => void;
  handleViewChange: (view: LinksView) => void;
}

export interface LinksStore {
  view: LinksView;
  groups: LinkGroup[];
  summary: LinkSummary;
  links: Link[];
  total: number;
  query: LinksListQuery | null;
  loadedQuery: LinksListQuery | null;
  localSearch: string;
  emptySearchCache: LinksListCache | null;
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isListLoading: boolean;
  isSearchLoading: boolean;
  listRequestId: number;
  removeTarget: Link | null;
  loadOverview: () => Promise<void>;
  loadList: (query: LinksListQuery) => Promise<void>;
  loadLinks: () => Promise<void>;
  openScope: (scope: string) => Promise<void>;
  searchLinks: (search: string) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  filterLinks: (state: LinkStateFilter) => Promise<void>;
  sortLinks: (sort: LinkSort) => Promise<void>;
  addGroup: (group: LinkGroup) => void;
  replaceGroup: (group: LinkGroup) => void;
  removeGroup: (groupId: string) => Promise<void>;
  setRemoveTarget: (link: Link | null) => void;
  setView: (view: LinksView) => void;
}
