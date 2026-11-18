import { signOut } from "@actions/auth";
import useAuthStore from "@stores/auth";

import type { UseProfilePageReturn } from "./types";

const useProfilePage = (): UseProfilePageReturn => {
  const { user, setUser } = useAuthStore();

  return { user, handleUserUpdated: setUser, handleSignOut: signOut };
};

export default useProfilePage;
