import type { AppEditorTab, Application, KvRole } from "@utils/types/application";

export interface OwnerPage {
  id: string;
  title: string;
}

export interface UseAppEditorPageReturn {
  applicationId: string;
  application: Application | null;
  ownerPage: OwnerPage | null;
  isEditing: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  hasFailed: boolean;
  refreshKey: number;
  tab: AppEditorTab;
  isTokenModalOpen: boolean;
  isRoleModalOpen: boolean;
  editingRole: KvRole | null;
  load: (applicationId: string | undefined, signal?: AbortSignal) => Promise<void>;
  reset: () => void;
  handleOpenRoleModal: (role: KvRole | null) => void;
  handleCloseRoleModal: () => void;
  handleRefresh: () => Promise<void>;
  handleTabChange: (tab: AppEditorTab) => void;
  handleCreated: (application: Application) => void;
  handleRemoved: () => void;
  handleOpenTokenModal: () => void;
  handleCloseTokenModal: () => void;
}

export interface AppEditorStore {
  application: Application | null;
  ownerPage: OwnerPage | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasFailed: boolean;
  refreshKey: number;
  isTokenModalOpen: boolean;
  isRoleModalOpen: boolean;
  editingRole: KvRole | null;
  load: (applicationId: string | undefined, signal?: AbortSignal) => Promise<void>;
  refresh: () => Promise<void>;
  setTokenModalOpen: (isOpen: boolean) => void;
  openRoleModal: (role: KvRole | null) => void;
  closeRoleModal: () => void;
  reset: () => void;
}
