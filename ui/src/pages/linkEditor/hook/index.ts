import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { linkEditorTabs } from "@assets/data";
import useLinkEditorStore from "./store";

import type { HistoryFilter, Link, LinkEditorTab, LinkEvent } from "@utils/types/link";
import type { UseLinkEditorPageReturn } from "./types";

const toTab = (value: string | null, isEditing: boolean): LinkEditorTab => {
  const match = linkEditorTabs.find((tab) => tab.value === value);
  return isEditing && match ? match.value : "settings";
};

const actorKey = (event: LinkEvent) => event.actor.id ?? "system";

const matchesFilter = (event: LinkEvent, filter: HistoryFilter, actor: string) => {
  const isSystem = event.actor.id === null;
  if (filter === "people" && isSystem) return false;
  if (filter === "system" && !isSystem) return false;
  return actor === "all" || actorKey(event) === actor;
};

const useLinkEditorPage = (): UseLinkEditorPageReturn => {
  const { linkId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const store = useLinkEditorStore();
  const tab = toTab(searchParams.get("tab"), Boolean(linkId));

  const handleLinkSaved = (saved: Link) => {
    if (linkId) {
      store.setSavedLink(saved);
      return;
    }
    navigate(`/links/${saved.id}/edit`, { replace: true });
  };

  const actorOptions = [
    { value: "all", label: "Todas as pessoas" },
    ...Array.from(new Map(store.events.map((event) => [actorKey(event), event.actor.name])).entries()).map(
      ([value, label]) => ({ value, label })
    )
  ];

  return {
    linkId,
    link: store.link,
    groups: store.groups,
    groupNames: Object.fromEntries(store.groups.map((group) => [group.id, group.name])),
    isLoading: store.isLoading,
    hasFailed: store.hasFailed,
    tab,
    events: store.events,
    visibleEvents: store.events.filter((event) => matchesFilter(event, store.historyFilter, store.historyActor)),
    actorOptions,
    nextCursor: store.nextCursor,
    hasLoadedHistory: store.hasLoadedHistory,
    isHistoryLoading: store.isHistoryLoading,
    isHistoryLoadingMore: store.isHistoryLoadingMore,
    historyFilter: store.historyFilter,
    historyActor: store.historyActor,
    range: store.range,
    analytics: store.analytics,
    isAnalyticsLoading: store.isAnalyticsLoading,
    load: store.load,
    loadHistory: store.loadHistory,
    loadAnalytics: store.loadAnalytics,
    handleGroupCreated: store.addGroup,
    handleLinkSaved,
    handleTabChange: (next) => setSearchParams(next === "settings" ? {} : { tab: next }, { replace: true }),
    handleRangeChange: store.setRange,
    handleHistoryFilterChange: store.setHistoryFilter,
    handleHistoryActorChange: store.setHistoryActor
  };
};

export default useLinkEditorPage;
