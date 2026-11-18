import type { AppEditorTab, Application } from "@utils/types/application";

export interface UseAppEditorPageReturn {
  applicationId: string;
  application: Application | null;
  isEditing: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  hasFailed: boolean;
  refreshKey: number;
  tab: AppEditorTab;
  isTokenModalOpen: boolean;
  load: (applicationId: string | undefined, signal?: AbortSignal) => Promise<void>;
  reset: () => void;
  handleRefresh: () => Promise<void>;
  handleTabChange: (tab: AppEditorTab) => void;
  handleCreated: (application: Application) => void;
  handleRemoved: () => void;
  handleOpenTokenModal: () => void;
  handleCloseTokenModal: () => void;
}

export interface AppEditorStore {
  application: Application | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasFailed: boolean;
  refreshKey: number;
  isTokenModalOpen: boolean;
  load: (applicationId: string | undefined, signal?: AbortSignal) => Promise<void>;
  refresh: () => Promise<void>;
  setTokenModalOpen: (isOpen: boolean) => void;
  reset: () => void;
}
