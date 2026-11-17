import type { AnalyticsRange, HistoryFilter, Link, LinkAnalytics, LinkEditorTab, LinkEvent, LinkGroup } from "@utils/types/link";
import type { SelectOption } from "@components/select/types";

export interface LinkEditorStore {
  requestKey: string;
  link: Link | null;
  groups: LinkGroup[];
  isLoading: boolean;
  hasFailed: boolean;
  events: LinkEvent[];
  nextCursor: string | null;
  hasLoadedHistory: boolean;
  isHistoryLoading: boolean;
  isHistoryLoadingMore: boolean;
  historyFilter: HistoryFilter;
  historyActor: string;
  range: AnalyticsRange;
  analytics: LinkAnalytics | null;
  isAnalyticsLoading: boolean;
  load: (linkId?: string) => Promise<void>;
  addGroup: (group: LinkGroup) => void;
  loadHistory: (isMore?: boolean) => Promise<void>;
  loadAnalytics: () => Promise<void>;
  setRange: (range: AnalyticsRange) => void;
  setHistoryFilter: (filter: HistoryFilter) => void;
  setHistoryActor: (actor: string) => void;
}

export interface UseLinkEditorPageReturn {
  linkId: string | undefined;
  link: Link | null;
  groups: LinkGroup[];
  groupNames: Record<string, string>;
  isLoading: boolean;
  hasFailed: boolean;
  tab: LinkEditorTab;
  events: LinkEvent[];
  visibleEvents: LinkEvent[];
  actorOptions: SelectOption[];
  nextCursor: string | null;
  hasLoadedHistory: boolean;
  isHistoryLoading: boolean;
  isHistoryLoadingMore: boolean;
  historyFilter: HistoryFilter;
  historyActor: string;
  range: AnalyticsRange;
  analytics: LinkAnalytics | null;
  isAnalyticsLoading: boolean;
  load: (linkId?: string) => Promise<void>;
  loadHistory: (isMore?: boolean) => Promise<void>;
  loadAnalytics: () => Promise<void>;
  handleGroupCreated: (group: LinkGroup) => void;
  handleTabChange: (tab: LinkEditorTab) => void;
  handleRangeChange: (range: AnalyticsRange) => void;
  handleHistoryFilterChange: (filter: HistoryFilter) => void;
  handleHistoryActorChange: (actor: string) => void;
}
