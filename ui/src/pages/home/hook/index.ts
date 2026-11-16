import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "@stores/auth";
import type { Application } from "@utils/types/application";

import useHomeStore from "./store";
import type { UseHomePageReturn } from "./types";

const useHomePage = (): UseHomePageReturn => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { applications, isLoading, isCreateModalOpen, isAuthModalOpen, loadApplications, setCreateModalOpen, setAuthModalOpen } =
    useHomeStore();

  const totalTokens = applications.reduce((total, application) => total + (application.tokens?.length ?? 0), 0);

  const handleSelectApplication = useCallback(
    (application: Application) => navigate(`/apps/${application.id}`),
    [navigate]
  );

  return {
    user,
    applications,
    isLoading,
    totalTokens,
    isCreateModalOpen,
    isAuthModalOpen,
    loadApplications,
    handleOpenCreate: () => setCreateModalOpen(true),
    handleCloseCreate: () => setCreateModalOpen(false),
    handleOpenAuth: () => setAuthModalOpen(true),
    handleCloseAuth: () => setAuthModalOpen(false),
    handleSelectApplication
  };
};

export default useHomePage;
