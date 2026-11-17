import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { listUsers } from "@actions/users";

import type { User } from "@utils/types/user";
import type { UserFormTarget } from "./types";

const logger = createLocalLogger("usersPage");

interface UsersStore {
  users: User[];
  isLoading: boolean;
  isRefreshing: boolean;
  formTarget: UserFormTarget | null;
  removeTarget: User | null;
  loadUsers: () => Promise<void>;
  setFormTarget: (target: UserFormTarget | null) => void;
  setRemoveTarget: (user: User | null) => void;
}

const useUsersStore = create<UsersStore>()((set, get) => ({
  users: [],
  isLoading: true,
  isRefreshing: false,
  formTarget: null,
  removeTarget: null,
  loadUsers: async () => {
    const isFirstLoad = get().users.length === 0;
    set(isFirstLoad ? { isLoading: true } : { isRefreshing: true });
    try {
      set({ users: await listUsers() });
    } catch (error) {
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar os usuários"));
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },
  setFormTarget: (formTarget) => set({ formTarget }),
  setRemoveTarget: (removeTarget) => set({ removeTarget })
}));

export default useUsersStore;
