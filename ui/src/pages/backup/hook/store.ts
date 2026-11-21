import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getBackupSummary } from "@actions/backup";

import type { BackupStore } from "./types";

const logger = createLocalLogger("backupPage");

const useBackupStore = create<BackupStore>()((set) => ({
  summary: null,
  isLoading: false,
  scope: "full",
  preview: null,
  result: null,
  uploadProgress: 0,
  isConfirmOpen: false,
  load: async () => {
    set({ isLoading: true });
    try {
      set({ summary: await getBackupSummary() });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar o resumo do backup"));
    } finally {
      set({ isLoading: false });
    }
  },
  setScope: (scope) => set({ scope }),
  setPreview: (preview) => set({ preview }),
  setResult: (result) => set({ result }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setIsConfirmOpen: (isConfirmOpen) => set({ isConfirmOpen })
}));

export default useBackupStore;
