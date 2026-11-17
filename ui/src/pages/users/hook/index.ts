import useAuthStore from "@stores/auth";
import useUsersStore from "./store";

import type { UseUsersPageReturn } from "./types";

const useUsersPage = (): UseUsersPageReturn => {
  const { user } = useAuthStore();
  const { users, isLoading, isRefreshing, formTarget, removeTarget, loadUsers, setFormTarget, setRemoveTarget } =
    useUsersStore();

  return {
    users,
    isLoading,
    isRefreshing,
    currentUserId: user?.id,
    formTarget,
    removeTarget,
    loadUsers,
    handleOpenCreate: () => setFormTarget({ mode: "create" }),
    handleOpenEdit: (target) => setFormTarget({ mode: "edit", user: target }),
    handleCloseForm: () => setFormTarget(null),
    handleOpenRemove: setRemoveTarget,
    handleCloseRemove: () => setRemoveTarget(null)
  };
};

export default useUsersPage;
