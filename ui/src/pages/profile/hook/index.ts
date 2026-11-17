import useAuthStore from "@stores/auth";

import type { UseProfilePageReturn } from "./types";

const useProfilePage = (): UseProfilePageReturn => {
  const { user, setUser, clearSession } = useAuthStore();

  return { user, handleUserUpdated: setUser, handleSignOut: clearSession };
};

export default useProfilePage;
