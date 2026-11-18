import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { historyPageSize } from "@assets/config";
import { measureBytes } from "@utils/functions";
import { pageEditorTabs } from "@assets/data";
import usePageEditorStore from "./store";

import type { HistoryFilter, SitePage, PageEditorTab, PageEvent } from "@utils/types/sitePage";
import type { UsePageEditorPageReturn } from "./types";

const toTab = (value: string | null, isEditing: boolean): PageEditorTab => {
  const match = pageEditorTabs.find((tab) => tab.value === value);
  if (!isEditing) return "settings";
  return match ? match.value : "editor";
};

const actorKey = (event: PageEvent) => event.actor.id ?? "system";

const matchesFilter = (event: PageEvent, filter: HistoryFilter, actor: string) => {
  const isSystem = event.actor.id === null;
  if (filter === "people" && isSystem) return false;
  if (filter === "system" && !isSystem) return false;
  return actor === "all" || actorKey(event) === actor;
};

const usePageEditorPage = (): UsePageEditorPageReturn => {
  const { pageId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const store = usePageEditorStore();
  const tab = toTab(searchParams.get("tab"), Boolean(pageId));

  const handlePageSaved = (saved: SitePage) => {
    if (pageId) {
      store.setSavedPage(saved);
      return;
    }
    navigate(`/pages/${saved.id}/edit`, { replace: true });
  };

  const actorOptions = [
    { value: "all", label: "Todas as pessoas" },
    ...Array.from(new Map(store.events.map((event) => [actorKey(event), event.actor.name])).entries()).map(
      ([value, label]) => ({ value, label })
    )
  ];

  const requestedGroupId = pageId ? "" : (searchParams.get("group") ?? "");

  const handleVersionRestore = async (number: number) => {
    const isRestored = await store.restoreVersion(number);
    if (isRestored) setSearchParams({}, { replace: true });
  };

  return {
    draft: store.draft,
    isDirty: store.sitePage !== null && store.draft.html !== (store.sitePage.html ?? ""),
    draftSize: measureBytes(store.draft.html),
    versions: store.versions,
    versionHtml: store.versionHtml,
    hasLoadedVersions: store.hasLoadedVersions,
    isVersionsLoading: store.isVersionsLoading,
    selectedVersion: store.selectedVersion,
    setDraftHtml: store.setDraftHtml,
    setDraftMessage: store.setDraftMessage,
    discardDraft: store.discardDraft,
    loadVersions: store.loadVersions,
    loadVersionHtml: store.loadVersionHtml,
    handleVersionSelect: store.selectVersion,
    handleVersionRestore: (number) => {
      handleVersionRestore(number);
    },
    pageId,
    defaultGroupId: store.groups.some((group) => group.id === requestedGroupId) ? requestedGroupId : "",
    sitePage: store.sitePage,
    groups: store.groups,
    groupNames: Object.fromEntries(store.groups.map((group) => [group.id, group.name])),
    isLoading: store.isLoading,
    hasFailed: store.hasFailed,
    tab,
    events: store.events,
    visibleEvents: store.events.filter((event) => matchesFilter(event, store.historyFilter, store.historyActor)),
    actorOptions,
    historyPage: store.historyPage,
    historyTotal: store.historyTotal,
    historyTotalPages: Math.max(1, Math.ceil(store.historyTotal / historyPageSize)),
    hasLoadedHistory: store.hasLoadedHistory,
    isHistoryLoading: store.isHistoryLoading,
    historyFilter: store.historyFilter,
    historyActor: store.historyActor,
    range: store.range,
    analytics: store.analytics,
    isAnalyticsLoading: store.isAnalyticsLoading,
    load: store.load,
    loadHistory: store.loadHistory,
    loadAnalytics: store.loadAnalytics,
    handleGroupCreated: store.addGroup,
    handlePageSaved,
    handleTabChange: (next) => setSearchParams(next === "editor" ? {} : { tab: next }, { replace: true }),
    handleHistoryPageChange: (page) => {
      store.loadHistory(page);
    },
    handleRangeChange: store.setRange,
    handleHistoryFilterChange: store.setHistoryFilter,
    handleHistoryActorChange: store.setHistoryActor
  };
};

export default usePageEditorPage;
