import type { Application } from "@utils/types/application";

export interface UseHomePageReturn {
  applications: Application[];
  filteredApplications: Application[];
  isLoading: boolean;
  isRefreshing: boolean;
  search: string;
  totalTokens: number;
  openOriginCount: number;
  isCreateModalOpen: boolean;
  loadApplications: () => Promise<void>;
  handleSearchChange: (search: string) => void;
  handleOpenCreate: () => void;
  handleCloseCreate: () => void;
}

export interface HomeStore {
  applications: Application[];
  isLoading: boolean;
  isRefreshing: boolean;
  search: string;
  isCreateModalOpen: boolean;
  loadApplications: () => Promise<void>;
  setSearch: (search: string) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
}
