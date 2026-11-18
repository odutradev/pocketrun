import { useSearchParams } from "react-router-dom";

import useLinksStore from "./store";

import type { LinkGroupSummary, UseLinksPageReturn } from "./types";
import type { Link, LinkGroup } from "@utils/types/link";

const matchesSearch = (link: Link, search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [link.title, link.slug, link.url].some((value) => value.toLowerCase().includes(term));
};

const summarizeGroup = (group: LinkGroup, links: Link[]): LinkGroupSummary => {
  const groupLinks = links.filter((link) => link.groupId === group.id);
  return { group, linkCount: groupLinks.length, clicks: groupLinks.reduce((total, link) => total + link.clicks, 0) };
};

const scopeLinks = (links: Link[], activeGroup: LinkGroup | null, isSearching: boolean) => {
  if (activeGroup) return links.filter((link) => link.groupId === activeGroup.id);
  if (isSearching) return links;
  return links.filter((link) => link.groupId === null);
};

const useLinksPage = (): UseLinksPageReturn => {
  const [searchParams] = useSearchParams();
  const {
    view,
    links,
    groups,
    isLoading,
    isRefreshing,
    search,
    isGroupsOpen,
    removeTarget,
    loadLinks,
    setSearch,
    setGroupsOpen,
    setRemoveTarget,
    setView
  } = useLinksStore();

  const groupId = searchParams.get("group");
  const activeGroup = groups.find((group) => group.id === groupId) ?? null;
  const isSearching = search.trim() !== "";

  return {
    view,
    links,
    visibleLinks: scopeLinks(links, activeGroup, isSearching).filter((link) => matchesSearch(link, search)),
    groups,
    groupSummaries: groups.map((group) => summarizeGroup(group, links)),
    activeGroup,
    isGroupMissing: groupId !== null && activeGroup === null && !isLoading && !isRefreshing,
    isSearching,
    isLoading,
    isRefreshing,
    search,
    isGroupsOpen,
    removeTarget,
    loadLinks,
    handleSearchChange: setSearch,
    handleOpenGroups: () => setGroupsOpen(true),
    handleCloseGroups: () => setGroupsOpen(false),
    handleOpenRemove: setRemoveTarget,
    handleCloseRemove: () => setRemoveTarget(null),
    handleViewChange: setView
  };
};

export default useLinksPage;
