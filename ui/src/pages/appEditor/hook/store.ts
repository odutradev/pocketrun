import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getApplication, getApplicationAnalytics } from "@actions/apps";
import { getPage } from "@actions/sitePages";

import type { Application } from "@utils/types/application";
import type { AppEditorStore, OwnerPage } from "./types";

const logger = createLocalLogger("appEditorPage");

const findOwnerPage = async (application: Application, signal?: AbortSignal): Promise<OwnerPage | null> => {
  if (!application.pageId) return null;
  try {
    const page = await getPage(application.pageId, signal);
    return { id: page.id, title: page.title };
  } catch (error) {
    logger.warn(error);
    return null;
  }
};

const initialState = {
  application: null,
  ownerPage: null,
  isLoading: true,
  isRefreshing: false,
  hasFailed: false,
  refreshKey: 0,
  isTokenModalOpen: false,
  isRoleModalOpen: false,
  editingRole: null,
  analytics: null,
  isAnalyticsLoading: false
};

const useAppEditorStore = create<AppEditorStore>()((set, get) => ({
  ...initialState,
  analyticsRange: "30d",
  analyticsRequestId: 0,
  load: async (applicationId, signal) => {
    if (!applicationId) {
      set({ ...initialState, isLoading: false });
      return;
    }
    set({ isLoading: true, hasFailed: false });
    try {
      const application = await getApplication(applicationId, signal);
      const ownerPage = await findOwnerPage(application, signal);
      set({ application, ownerPage, isLoading: false });
    } catch (error) {
      if (signal?.aborted) return;
      logger.error(error);
      set({ isLoading: false, hasFailed: true });
    }
  },
  refresh: async () => {
    const { application } = get();
    if (!application) return;
    set((state) => ({ isRefreshing: true, refreshKey: state.refreshKey + 1 }));
    try {
      set({ application: await getApplication(application.id) });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível atualizar a aplicação"));
    } finally {
      set({ isRefreshing: false });
    }
  },
  loadAnalytics: async () => {
    const { application, analyticsRange, analyticsRequestId: previousRequestId } = get();
    if (!application) return;
    const analyticsRequestId = previousRequestId + 1;
    set({ isAnalyticsLoading: true, analyticsRequestId });
    try {
      const analytics = await getApplicationAnalytics(application.id, analyticsRange);
      if (get().analyticsRequestId !== analyticsRequestId) return;
      set({ analytics });
    } catch (error) {
      if (get().analyticsRequestId !== analyticsRequestId) return;
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar a análise da aplicação"));
    } finally {
      if (get().analyticsRequestId === analyticsRequestId) set({ isAnalyticsLoading: false });
    }
  },
  setAnalyticsRange: (analyticsRange) => set({ analyticsRange }),
  setTokenModalOpen: (isTokenModalOpen) => set({ isTokenModalOpen }),
  openRoleModal: (editingRole) => set({ isRoleModalOpen: true, editingRole }),
  closeRoleModal: () => set({ isRoleModalOpen: false, editingRole: null }),
  reset: () => set(initialState)
}));

export default useAppEditorStore;
