import { toast } from "react-toastify";
import { create } from "zustand";

import { getPage, getPageAccess, getPageAnalytics, getPageHistory, getPageKv, getPageVersion, listPageGroups, listPageKvRequests, listPageVersions } from "@actions/sitePages";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import usePageDraftsStore from "@stores/pageDrafts";
import { historyPageSize } from "@assets/config";

import type { PageDraft, SitePage } from "@utils/types/sitePage";
import type { PageEditorStore } from "./types";

const logger = createLocalLogger("pageEditorPage");

const toDraft = (sitePage: SitePage | null): PageDraft => ({ html: sitePage?.html ?? "", restoredFrom: null, message: "" });

const usePageEditorStore = create<PageEditorStore>()((set, get) => ({
  requestKey: "",
  draft: { html: "", restoredFrom: null, message: "" },
  versions: [],
  versionHtml: {},
  hasLoadedVersions: false,
  isVersionsLoading: false,
  selectedVersion: null,
  recoverableDraft: null,
  sitePage: null,
  groups: [],
  isLoading: true,
  hasFailed: false,
  events: [],
  historyPage: 1,
  historyTotal: 0,
  historyCursors: {},
  historyRequestId: 0,
  hasLoadedHistory: false,
  isHistoryLoading: false,
  historyFilter: "all",
  historyActor: "all",
  range: "7d",
  analytics: null,
  isAnalyticsLoading: false,
  access: null,
  hasLoadedAccess: false,
  kv: null,
  hasLoadedKv: false,
  kvRequests: null,
  isKvRequestsLoading: false,
  previewAs: "",
  load: async (pageId) => {
    const requestKey = pageId ?? "new";
    set({
      requestKey,
      sitePage: null,
      isLoading: true,
      hasFailed: false,
      events: [],
      historyPage: 1,
      historyTotal: 0,
      historyCursors: {},
      hasLoadedHistory: false,
      historyFilter: "all",
      historyActor: "all",
      analytics: null,
      access: null,
      hasLoadedAccess: false,
      kv: null,
      hasLoadedKv: false,
      kvRequests: null,
      previewAs: "",
      draft: { html: "", restoredFrom: null, message: "" },
      versions: [],
      versionHtml: {},
      hasLoadedVersions: false,
      selectedVersion: null,
      recoverableDraft: null
    });
    try {
      const [groups, sitePage, kv, access] = await Promise.all([
        listPageGroups(),
        pageId ? getPage(pageId) : Promise.resolve(null),
        pageId ? getPageKv(pageId) : Promise.resolve(null),
        pageId ? getPageAccess(pageId) : Promise.resolve(null)
      ]);
      if (get().requestKey !== requestKey) return;
      const stored = sitePage ? usePageDraftsStore.getState().drafts[sitePage.id] : undefined;
      const recoverableDraft = stored && stored.html !== (sitePage?.html ?? "") ? stored : null;
      if (sitePage && stored && !recoverableDraft) usePageDraftsStore.getState().clearDraft(sitePage.id);
      set({
        groups,
        sitePage,
        draft: toDraft(sitePage),
        recoverableDraft,
        kv,
        hasLoadedKv: Boolean(kv),
        access,
        hasLoadedAccess: Boolean(access)
      });
    } catch (error) {
      if (get().requestKey !== requestKey) return;
      logger.error(error);
      set({ hasFailed: true });
      toast.error(getErrorMessage(error, "Não foi possível carregar a página"));
    } finally {
      if (get().requestKey === requestKey) set({ isLoading: false });
    }
  },
  addGroup: (group) =>
    set((state) => ({ groups: [...state.groups, group].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")) })),
  setSavedPage: (saved) =>
    set((state) => {
      const sitePage = { ...saved, html: saved.html ?? state.sitePage?.html };
      const wasDirty = state.draft.html !== (state.sitePage?.html ?? "");
      const isDraftSaved = state.draft.html === (sitePage.html ?? "");
      return {
        sitePage,
        draft: wasDirty && !isDraftSaved ? state.draft : toDraft(sitePage),
        events: [],
        historyPage: 1,
        historyTotal: 0,
        historyCursors: {},
        hasLoadedHistory: false,
        hasLoadedVersions: false
      };
    }),
  loadHistory: async (page = 1) => {
    const { sitePage, historyCursors, historyRequestId: previousRequestId, requestKey } = get();
    const before = historyCursors[page];
    if (!sitePage || (page > 1 && !before)) return;
    const historyRequestId = previousRequestId + 1;
    set({ isHistoryLoading: true, historyRequestId });
    try {
      const result = await getPageHistory(sitePage.id, { before, limit: historyPageSize });
      if (get().requestKey !== requestKey || get().historyRequestId !== historyRequestId) return;
      set((state) => ({
        events: result.events,
        historyPage: page,
        historyTotal: result.total,
        historyCursors: result.nextCursor ? { ...state.historyCursors, [page + 1]: result.nextCursor } : state.historyCursors,
        hasLoadedHistory: true
      }));
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar o histórico"));
    } finally {
      if (get().historyRequestId === historyRequestId) set({ isHistoryLoading: false });
    }
  },
  loadAnalytics: async () => {
    const { sitePage, range, requestKey } = get();
    if (!sitePage) return;
    set({ isAnalyticsLoading: true });
    try {
      const analytics = await getPageAnalytics(sitePage.id, range);
      if (get().requestKey !== requestKey || get().range !== range) return;
      set({ analytics });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar a análise"));
    } finally {
      if (get().range === range) set({ isAnalyticsLoading: false });
    }
  },
  loadAccess: async () => {
    const { sitePage, requestKey } = get();
    if (!sitePage) return;
    try {
      const access = await getPageAccess(sitePage.id);
      if (get().requestKey !== requestKey) return;
      set({ access, hasLoadedAccess: true });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar o acesso da página"));
    }
  },
  setAccess: (access) => set({ access, hasLoadedAccess: true, events: [], historyPage: 1, historyTotal: 0, historyCursors: {}, hasLoadedHistory: false }),
  setKv: (kv) => set({ kv, hasLoadedKv: true, events: [], historyPage: 1, historyTotal: 0, historyCursors: {}, hasLoadedHistory: false }),
  loadKvRequests: async () => {
    const { sitePage, requestKey } = get();
    if (!sitePage) return;
    set({ isKvRequestsLoading: true });
    try {
      const kvRequests = await listPageKvRequests(sitePage.id);
      if (get().requestKey !== requestKey) return;
      set({ kvRequests });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar os pedidos ao KV"));
    } finally {
      if (get().requestKey === requestKey) set({ isKvRequestsLoading: false });
    }
  },
  setPreviewAs: (previewAs) => set({ previewAs }),
  setRange: (range) => set({ range }),
  setHistoryFilter: (historyFilter) => set({ historyFilter }),
  setHistoryActor: (historyActor) => set({ historyActor }),
  setDraftHtml: (html) => set((state) => ({ draft: { ...state.draft, html } })),
  setDraftMessage: (message) => set((state) => ({ draft: { ...state.draft, message } })),
  recoverDraft: () =>
    set((state) => {
      if (!state.recoverableDraft) return state;
      const { html, restoredFrom, message } = state.recoverableDraft;
      return { draft: { html, restoredFrom, message }, recoverableDraft: null };
    }),
  dismissRecoverableDraft: () => {
    const { sitePage } = get();
    if (sitePage) usePageDraftsStore.getState().clearDraft(sitePage.id);
    set({ recoverableDraft: null });
  },
  discardDraft: () => set((state) => ({ draft: toDraft(state.sitePage) })),
  loadVersions: async () => {
    const { sitePage, requestKey } = get();
    if (!sitePage) return;
    set({ isVersionsLoading: true });
    try {
      const versions = await listPageVersions(sitePage.id);
      if (get().requestKey !== requestKey) return;
      set((state) => ({
        versions,
        hasLoadedVersions: true,
        selectedVersion: versions.some((version) => version.number === state.selectedVersion) ? state.selectedVersion : (versions[0]?.number ?? null)
      }));
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar as versões"));
    } finally {
      if (get().requestKey === requestKey) set({ isVersionsLoading: false });
    }
  },
  loadVersionHtml: async (number) => {
    const { sitePage, versionHtml, requestKey } = get();
    if (!sitePage) return null;
    if (versionHtml[number] !== undefined) return versionHtml[number];
    try {
      const version = await getPageVersion(sitePage.id, number);
      const html = version.html ?? "";
      if (get().requestKey === requestKey) set((state) => ({ versionHtml: { ...state.versionHtml, [number]: html } }));
      return html;
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível abrir a versão"));
      return null;
    }
  },
  selectVersion: (selectedVersion) => set({ selectedVersion }),
  restoreVersion: async (number) => {
    const html = await get().loadVersionHtml(number);
    if (html === null) return false;
    set((state) => ({ draft: { ...state.draft, html, restoredFrom: number } }));
    return true;
  }
}));

export default usePageEditorStore;
