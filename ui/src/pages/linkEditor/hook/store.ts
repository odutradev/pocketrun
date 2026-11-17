import { toast } from "react-toastify";
import { create } from "zustand";

import { getLink, getLinkAnalytics, getLinkHistory, listLinkGroups } from "@actions/links";
import { createLocalLogger, getErrorMessage } from "@utils/functions";

import type { LinkEditorStore } from "./types";

const logger = createLocalLogger("linkEditorPage");

const useLinkEditorStore = create<LinkEditorStore>()((set, get) => ({
  requestKey: "",
  link: null,
  groups: [],
  isLoading: true,
  hasFailed: false,
  events: [],
  nextCursor: null,
  hasLoadedHistory: false,
  isHistoryLoading: false,
  isHistoryLoadingMore: false,
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
      nextCursor: null,
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
  loadHistory: async (isMore = false) => {
    const { link, nextCursor, requestKey } = get();
    if (!link) return;
    set(isMore ? { isHistoryLoadingMore: true } : { isHistoryLoading: true });
    try {
      const page = await getLinkHistory(link.id, isMore ? nextCursor ?? undefined : undefined);
      if (get().requestKey !== requestKey) return;
      set((state) => ({
        events: isMore ? [...state.events, ...page.events] : page.events,
        nextCursor: page.nextCursor,
        hasLoadedHistory: true
      }));
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar o histórico"));
    } finally {
      set({ isHistoryLoading: false, isHistoryLoadingMore: false });
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
