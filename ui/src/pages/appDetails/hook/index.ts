import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useAppDetailsStore from "./store";
import type { DetailsTab, UseAppDetailsPageReturn } from "./types";

const useAppDetailsPage = (): UseAppDetailsPageReturn => {
  const navigate = useNavigate();
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
    handleTabChange: (tab) => setActiveTab(tab as DetailsTab),
    handleBack: () => navigate("/"),
    handleRefresh,
    handleOpenTokenModal: () => setTokenModalOpen(true),
    handleCloseTokenModal: () => setTokenModalOpen(false)
  };
};

export default useAppDetailsPage;
