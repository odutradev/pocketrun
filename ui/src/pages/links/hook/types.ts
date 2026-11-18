import type { Link, LinkGroup, LinksView } from "@utils/types/link";

export interface LinkGroupSummary {
  group: LinkGroup;
  linkCount: number;
  clicks: number;
}

export interface UseLinksPageReturn {
  view: LinksView;
  links: Link[];
  visibleLinks: Link[];
  groups: LinkGroup[];
  groupSummaries: LinkGroupSummary[];
  activeGroup: LinkGroup | null;
  isGroupMissing: boolean;
  isSearching: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  search: string;
  isGroupsOpen: boolean;
  removeTarget: Link | null;
  loadLinks: () => Promise<void>;
  handleSearchChange: (search: string) => void;
  handleOpenGroups: () => void;
  handleCloseGroups: () => void;
  handleOpenRemove: (link: Link) => void;
  handleCloseRemove: () => void;
  handleViewChange: (view: LinksView) => void;
}

export interface LinksStore {
  view: LinksView;
  links: Link[];
  groups: LinkGroup[];
  isLoading: boolean;
  isRefreshing: boolean;
  search: string;
  isGroupsOpen: boolean;
  removeTarget: Link | null;
  loadLinks: () => Promise<void>;
  setSearch: (search: string) => void;
  setGroupsOpen: (isOpen: boolean) => void;
  setRemoveTarget: (link: Link | null) => void;
  setView: (view: LinksView) => void;
}
