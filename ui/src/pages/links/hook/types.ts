import type { Link, LinkGroup, LinkSummary, LinksView } from "@utils/types/link";

export interface LinkGroupSummary {
  group: LinkGroup;
  linkCount: number;
  clicks: number;
}

export interface LinksListQuery {
  scope: string;
  search: string;
  page: number;
}

export interface UseLinksPageReturn {
  view: LinksView;
  links: Link[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  transitionKey: string;
  groups: LinkGroup[];
  groupSummaries: LinkGroupSummary[];
  activeGroup: LinkGroup | null;
  scope: string;
  hasNoLinks: boolean;
  isGroupMissing: boolean;
  isSearching: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isScopePending: boolean;
  isListLoading: boolean;
  isSearchLoading: boolean;
  isGroupsOpen: boolean;
  removeTarget: Link | null;
  loadLinks: () => Promise<void>;
  openScope: (scope: string) => Promise<void>;
  handleSearch: (search: string) => void;
  handlePageChange: (page: number) => void;
  handleOpenGroups: () => void;
  handleCloseGroups: () => void;
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
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isListLoading: boolean;
  isSearchLoading: boolean;
  listRequestId: number;
  isGroupsOpen: boolean;
  removeTarget: Link | null;
  loadOverview: () => Promise<void>;
  loadList: (query: LinksListQuery) => Promise<void>;
  loadLinks: () => Promise<void>;
  openScope: (scope: string) => Promise<void>;
  searchLinks: (search: string) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  setGroupsOpen: (isOpen: boolean) => void;
  setRemoveTarget: (link: Link | null) => void;
  setView: (view: LinksView) => void;
}
