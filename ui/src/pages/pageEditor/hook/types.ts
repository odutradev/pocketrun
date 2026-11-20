import type {
  AnalyticsRange,
  HistoryFilter,
  LinkAnalytics,
  PageAccess,
  PageDraft,
  PageEditorTab,
  PageEvent,
  PageGroup,
  PageKvDetails,
  PageKvRequestSummary,
  PageRuntimeExtra,
  PageTemplate,
  PageVersion,
  SitePage,
  StoredPageDraft
} from "@utils/types/sitePage";
import type { SelectOption } from "@components/select/types";

export interface PageEditorStore {
  requestKey: string;
  draft: PageDraft;
  versions: PageVersion[];
  versionHtml: Record<number, string>;
  hasLoadedVersions: boolean;
  isVersionsLoading: boolean;
  selectedVersion: number | null;
  recoverableDraft: StoredPageDraft | null;
  sitePage: SitePage | null;
  groups: PageGroup[];
  isLoading: boolean;
  hasFailed: boolean;
  events: PageEvent[];
  historyPage: number;
  historyTotal: number;
  historyCursors: Record<number, string>;
  historyRequestId: number;
  hasLoadedHistory: boolean;
  isHistoryLoading: boolean;
  historyFilter: HistoryFilter;
  historyActor: string;
  range: AnalyticsRange;
  analytics: LinkAnalytics | null;
  isAnalyticsLoading: boolean;
  access: PageAccess | null;
  hasLoadedAccess: boolean;
  kv: PageKvDetails | null;
  hasLoadedKv: boolean;
  kvRequests: PageKvRequestSummary | null;
  isKvRequestsLoading: boolean;
  previewAs: string;
  load: (pageId?: string) => Promise<void>;
  loadAccess: () => Promise<void>;
  setAccess: (access: PageAccess) => void;
  setKv: (kv: PageKvDetails) => void;
  loadKvRequests: () => Promise<void>;
  setPreviewAs: (previewAs: string) => void;
  addGroup: (group: PageGroup) => void;
  setSavedPage: (sitePage: SitePage) => void;
  loadHistory: (page?: number) => Promise<void>;
  loadAnalytics: () => Promise<void>;
  setRange: (range: AnalyticsRange) => void;
  setHistoryFilter: (filter: HistoryFilter) => void;
  setHistoryActor: (actor: string) => void;
  setDraftHtml: (html: string) => void;
  setDraftMessage: (message: string) => void;
  discardDraft: () => void;
  recoverDraft: () => void;
  dismissRecoverableDraft: () => void;
  loadVersions: () => Promise<void>;
  loadVersionHtml: (number: number) => Promise<string | null>;
  selectVersion: (number: number | null) => void;
  restoreVersion: (number: number) => Promise<boolean>;
}

export interface UsePageEditorPageReturn {
  draft: PageDraft;
  isDirty: boolean;
  draftSize: number;
  versions: PageVersion[];
  versionHtml: Record<number, string>;
  hasLoadedVersions: boolean;
  isVersionsLoading: boolean;
  selectedVersion: number | null;
  recoverableDraft: StoredPageDraft | null;
  handleDraftRecover: () => void;
  handleDraftDismiss: () => void;
  setDraftHtml: (html: string) => void;
  setDraftMessage: (message: string) => void;
  discardDraft: () => void;
  loadVersions: () => Promise<void>;
  loadVersionHtml: (number: number) => Promise<string | null>;
  handleVersionSelect: (number: number | null) => void;
  handleVersionRestore: (number: number) => void;
  pageId: string | undefined;
  defaultGroupId: string;
  defaultTemplate: PageTemplate;
  sitePage: SitePage | null;
  groups: PageGroup[];
  groupNames: Record<string, string>;
  isLoading: boolean;
  hasFailed: boolean;
  tab: PageEditorTab;
  events: PageEvent[];
  visibleEvents: PageEvent[];
  actorOptions: SelectOption[];
  historyPage: number;
  historyTotal: number;
  historyTotalPages: number;
  hasLoadedHistory: boolean;
  isHistoryLoading: boolean;
  historyFilter: HistoryFilter;
  historyActor: string;
  range: AnalyticsRange;
  analytics: LinkAnalytics | null;
  isAnalyticsLoading: boolean;
  access: PageAccess | null;
  hasLoadedAccess: boolean;
  kv: PageKvDetails | null;
  kvRequests: PageKvRequestSummary | null;
  isKvRequestsLoading: boolean;
  previewAs: string;
  previewOptions: SelectOption[];
  previewExtra: PageRuntimeExtra;
  load: (pageId?: string) => Promise<void>;
  loadAccess: () => Promise<void>;
  handleAccessChange: (access: PageAccess) => void;
  handleKvChange: (kv: PageKvDetails) => void;
  loadKvRequests: () => Promise<void>;
  handlePreviewAsChange: (previewAs: string) => void;
  loadHistory: (page?: number) => Promise<void>;
  loadAnalytics: () => Promise<void>;
  handleGroupCreated: (group: PageGroup) => void;
  handlePageSaved: (sitePage: SitePage) => void;
  handleTabChange: (tab: PageEditorTab) => void;
  handleHistoryPageChange: (page: number) => void;
  handleRangeChange: (range: AnalyticsRange) => void;
  handleHistoryFilterChange: (filter: HistoryFilter) => void;
  handleHistoryActorChange: (actor: string) => void;
}
