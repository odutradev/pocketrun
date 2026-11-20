import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { appEditorTabs } from "@assets/data";
import useAppEditorStore from "./store";

import type { AppEditorTab } from "@utils/types/application";
import type { UseAppEditorPageReturn } from "./types";

const toTab = (value: string | null, isEditing: boolean): AppEditorTab => {
  if (!isEditing) return "settings";
  return appEditorTabs.find((tab) => tab.value === value)?.value ?? "explorer";
};

const useAppEditorPage = (): UseAppEditorPageReturn => {
  const { applicationId = "" } = useParams<{ applicationId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const store = useAppEditorStore();
  const isEditing = applicationId !== "";

  return {
    applicationId,
    application: store.application,
    isEditing,
    isLoading: store.isLoading,
    isRefreshing: store.isRefreshing,
    hasFailed: store.hasFailed,
    refreshKey: store.refreshKey,
    tab: toTab(searchParams.get("tab"), isEditing),
    isTokenModalOpen: store.isTokenModalOpen,
    isRoleModalOpen: store.isRoleModalOpen,
    editingRole: store.editingRole,
    load: store.load,
    reset: store.reset,
    handleOpenRoleModal: store.openRoleModal,
    handleCloseRoleModal: store.closeRoleModal,
    handleRefresh: store.refresh,
    handleTabChange: (next) => setSearchParams(next === "explorer" ? {} : { tab: next }, { replace: true }),
    handleCreated: (application) => navigate(`/kv/${application.id}/edit`, { replace: true }),
    handleRemoved: () => navigate("/kv", { replace: true }),
    handleOpenTokenModal: () => store.setTokenModalOpen(true),
    handleCloseTokenModal: () => store.setTokenModalOpen(false)
  };
};

export default useAppEditorPage;
