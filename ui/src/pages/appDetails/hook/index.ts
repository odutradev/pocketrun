import { useParams } from "react-router-dom";
import { useCallback } from "react";

import useAppDetailsStore from "./store";

import type { UseAppDetailsPageReturn } from "./types";

const useAppDetailsPage = (): UseAppDetailsPageReturn => {
  const { applicationId = "" } = useParams<{ applicationId: string }>();
  const { application, isLoading, activeTab, isTokenModalOpen, loadApplication, setActiveTab, setTokenModalOpen, reset } =
    useAppDetailsStore();

  const handleRefresh = useCallback(() => loadApplication(applicationId), [loadApplication, applicationId]);

  return {
    applicationId,
    application,
    isLoading,
    activeTab,
    isTokenModalOpen,
    loadApplication,
    reset,
    handleTabChange: setActiveTab,
    handleRefresh,
    handleOpenTokenModal: () => setTokenModalOpen(true),
    handleCloseTokenModal: () => setTokenModalOpen(false)
  };
};

export default useAppDetailsPage;
