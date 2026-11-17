import type { Link, LinkGroup, LinksView } from "@utils/types/link";

export type GroupFilter = "all" | "none" | string;

export interface UseLinksPageReturn {
  view: LinksView;
  links: Link[];
  filteredLinks: Link[];
  groups: LinkGroup[];
  groupNames: Record<string, string>;
  isLoading: boolean;
  isRefreshing: boolean;
  search: string;
  groupFilter: GroupFilter;
  isGroupsOpen: boolean;
  removeTarget: Link | null;
  loadLinks: () => Promise<void>;
  handleSearchChange: (search: string) => void;
  handleGroupFilterChange: (groupFilter: GroupFilter) => void;
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
  groupFilter: GroupFilter;
  isGroupsOpen: boolean;
  removeTarget: Link | null;
  loadLinks: () => Promise<void>;
  setSearch: (search: string) => void;
  setGroupFilter: (groupFilter: GroupFilter) => void;
  setGroupsOpen: (isOpen: boolean) => void;
  setRemoveTarget: (link: Link | null) => void;
  setView: (view: LinksView) => void;
}
