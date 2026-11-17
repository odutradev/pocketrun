import useLinksStore from "./store";

import type { GroupFilter, UseLinksPageReturn } from "./types";
import type { Link } from "@utils/types/link";

const matchesSearch = (link: Link, search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [link.title, link.slug, link.url].some((value) => value.toLowerCase().includes(term));
};

const matchesGroup = (link: Link, groupFilter: GroupFilter) => {
  if (groupFilter === "all") return true;
  if (groupFilter === "none") return link.groupId === null;
  return link.groupId === groupFilter;
};

const useLinksPage = (): UseLinksPageReturn => {
  const {
    view,
    links,
    groups,
    isLoading,
    isRefreshing,
    search,
    groupFilter,
    isGroupsOpen,
    removeTarget,
    loadLinks,
    setSearch,
    setGroupFilter,
    setGroupsOpen,
    setRemoveTarget,
    setView
  } = useLinksStore();

  return {
    view,
    links,
    filteredLinks: links.filter((link) => matchesGroup(link, groupFilter) && matchesSearch(link, search)),
    groups,
    groupNames: Object.fromEntries(groups.map((group) => [group.id, group.name])),
    isLoading,
    isRefreshing,
    search,
    groupFilter,
    isGroupsOpen,
    removeTarget,
    loadLinks,
    handleSearchChange: setSearch,
    handleGroupFilterChange: setGroupFilter,
    handleOpenGroups: () => setGroupsOpen(true),
    handleCloseGroups: () => setGroupsOpen(false),
    handleOpenRemove: setRemoveTarget,
    handleCloseRemove: () => setRemoveTarget(null),
    handleViewChange: setView
  };
};

export default useLinksPage;
