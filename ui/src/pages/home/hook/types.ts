import type { Application } from "@utils/types/application";
import type { User } from "@utils/types/user";

export interface UseHomePageReturn {
  user: User | null;
  applications: Application[];
  isLoading: boolean;
  totalTokens: number;
  isCreateModalOpen: boolean;
  isAuthModalOpen: boolean;
  loadApplications: () => Promise<void>;
  handleOpenCreate: () => void;
  handleCloseCreate: () => void;
  handleOpenAuth: () => void;
  handleCloseAuth: () => void;
  handleSelectApplication: (application: Application) => void;
}
