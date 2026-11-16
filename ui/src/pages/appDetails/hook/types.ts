import type { Application } from "@utils/types/application";

export type DetailsTab = "security" | "tokens" | "explorer" | "snippets" | "danger";

export interface UseAppDetailsPageReturn {
  applicationId: string;
  application: Application | null;
  isLoading: boolean;
  activeTab: DetailsTab;
  isTokenModalOpen: boolean;
  loadApplication: (applicationId: string, signal?: AbortSignal) => Promise<void>;
  reset: () => void;
  handleTabChange: (tab: string) => void;
  handleBack: () => void;
  handleRefresh: () => Promise<void>;
  handleOpenTokenModal: () => void;
  handleCloseTokenModal: () => void;
}
