import type { Application } from "@utils/types/application";

export type DetailsTab = "explorer" | "snippets" | "tokens" | "security" | "danger";

export interface UseAppDetailsPageReturn {
  applicationId: string;
  application: Application | null;
  isLoading: boolean;
  activeTab: DetailsTab;
  isTokenModalOpen: boolean;
  loadApplication: (applicationId: string, signal?: AbortSignal) => Promise<void>;
  reset: () => void;
  handleTabChange: (tab: DetailsTab) => void;
  handleRefresh: () => Promise<void>;
  handleOpenTokenModal: () => void;
  handleCloseTokenModal: () => void;
}

export interface AppDetailsStore {
  application: Application | null;
  isLoading: boolean;
  activeTab: DetailsTab;
  isTokenModalOpen: boolean;
  loadApplication: (applicationId: string, signal?: AbortSignal) => Promise<void>;
  setActiveTab: (tab: DetailsTab) => void;
  setTokenModalOpen: (isOpen: boolean) => void;
  reset: () => void;
}
