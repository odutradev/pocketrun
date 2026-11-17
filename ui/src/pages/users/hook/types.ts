import type { User } from "@utils/types/user";

// O mesmo diálogo cria um usuário novo ou edita um existente.
export type UserFormTarget = { mode: "create" } | { mode: "edit"; user: User };

export interface UseUsersPageReturn {
  users: User[];
  isLoading: boolean;
  isRefreshing: boolean;
  currentUserId: string | undefined;
  formTarget: UserFormTarget | null;
  removeTarget: User | null;
  loadUsers: () => Promise<void>;
  handleOpenCreate: () => void;
  handleOpenEdit: (user: User) => void;
  handleCloseForm: () => void;
  handleOpenRemove: (user: User) => void;
  handleCloseRemove: () => void;
}
