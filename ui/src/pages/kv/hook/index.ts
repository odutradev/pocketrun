import { allowsAnyOrigin } from "@utils/functions";
import useKvStore from "./store";

import type { Application } from "@utils/types/application";
import type { UseKvPageReturn } from "./types";

const matchesSearch = (application: Application, search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [application.name, application.projectId, application.description].some((value) =>
    value.toLowerCase().includes(term)
  );
};

const useKvPage = (): UseKvPageReturn => {
  const {
    applications,
    isLoading,
    isRefreshing,
    search,
    isCreateModalOpen,
    loadApplications,
    setSearch,
    setCreateModalOpen
  } = useKvStore();

  return {
    applications,
    filteredApplications: applications.filter((application) => matchesSearch(application, search)),
    isLoading,
    isRefreshing,
    search,
    totalTokens: applications.reduce((total, application) => total + (application.tokens?.length ?? 0), 0),
    openOriginCount: applications.filter((application) => allowsAnyOrigin(application.allowedOrigins)).length,
    isCreateModalOpen,
    loadApplications,
    handleSearchChange: setSearch,
    handleOpenCreate: () => setCreateModalOpen(true),
    handleCloseCreate: () => setCreateModalOpen(false)
  };
};

export default useKvPage;
