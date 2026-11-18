import { toast } from "react-toastify";
import { create } from "zustand";

import { getLink, getLinkAnalytics, getLinkHistory, listLinkGroups } from "@actions/links";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { historyPageSize } from "@assets/config";

import type { LinkEditorStore } from "./types";

const logger = createLocalLogger("linkEditorPage");

const useLinkEditorStore = create<LinkEditorStore>()((set, get) => ({
  requestKey: "",
  link: null,
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
  load: async (linkId) => {
    const requestKey = linkId ?? "new";
    set({
      requestKey,
      link: null,
      isLoading: true,
      hasFailed: false,
      events: [],
      historyPage: 1,
      historyTotal: 0,
      historyCursors: {},
      hasLoadedHistory: false,
      historyFilter: "all",
      historyActor: "all",
      analytics: null
    });
    try {
      const [groups, link] = await Promise.all([listLinkGroups(), linkId ? getLink(linkId) : Promise.resolve(null)]);
      if (get().requestKey !== requestKey) return;
      set({ groups, link });
    } catch (error) {
      if (get().requestKey !== requestKey) return;
      logger.error(error);
      set({ hasFailed: true });
      toast.error(getErrorMessage(error, "Não foi possível carregar o link"));
    } finally {
      if (get().requestKey === requestKey) set({ isLoading: false });
    }
  },
  addGroup: (group) =>
    set((state) => ({ groups: [...state.groups, group].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")) })),
  setSavedLink: (link) =>
    set({ link, events: [], historyPage: 1, historyTotal: 0, historyCursors: {}, hasLoadedHistory: false }),
  loadHistory: async (page = 1) => {
    const { link, historyCursors, historyRequestId: previousRequestId, requestKey } = get();
    const before = historyCursors[page];
    if (!link || (page > 1 && !before)) return;
    const historyRequestId = previousRequestId + 1;
    set({ isHistoryLoading: true, historyRequestId });
    try {
      const result = await getLinkHistory(link.id, { before, limit: historyPageSize });
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
    const { link, range, requestKey } = get();
    if (!link) return;
    set({ isAnalyticsLoading: true });
    try {
      const analytics = await getLinkAnalytics(link.id, range);
      if (get().requestKey !== requestKey || get().range !== range) return;
      set({ analytics });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar a análise"));
    } finally {
      if (get().range === range) set({ isAnalyticsLoading: false });
    }
  },
  setRange: (range) => set({ range }),
  setHistoryFilter: (historyFilter) => set({ historyFilter }),
  setHistoryActor: (historyActor) => set({ historyActor })
}));

export default useLinkEditorStore;
