import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getApplication } from "@actions/apps";

import type { AppEditorStore } from "./types";

const logger = createLocalLogger("appEditorPage");

const initialState = {
  application: null,
  isLoading: true,
  isRefreshing: false,
  hasFailed: false,
  refreshKey: 0,
  isTokenModalOpen: false,
  isRoleModalOpen: false,
  editingRole: null
};

const useAppEditorStore = create<AppEditorStore>()((set, get) => ({
  ...initialState,
  load: async (applicationId, signal) => {
    if (!applicationId) {
      set({ ...initialState, isLoading: false });
      return;
    }
    set({ isLoading: true, hasFailed: false });
    try {
      set({ application: await getApplication(applicationId, signal), isLoading: false });
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
  setTokenModalOpen: (isTokenModalOpen) => set({ isTokenModalOpen }),
  openRoleModal: (editingRole) => set({ isRoleModalOpen: true, editingRole }),
  closeRoleModal: () => set({ isRoleModalOpen: false, editingRole: null }),
  reset: () => set(initialState)
}));

export default useAppEditorStore;
