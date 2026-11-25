import { signOut } from "@actions/auth";
import useAuthStore from "@stores/auth";
import useProfileStore from "./store";

import type { UseProfilePageReturn } from "./types";

const useProfilePage = (): UseProfilePageReturn => {
  const { user, setUser } = useAuthStore();
  const { apiKeys, isLoadingApiKeys, loadApiKeys } = useProfileStore();

  return { user, apiKeys, isLoadingApiKeys, loadApiKeys, handleUserUpdated: setUser, handleSignOut: signOut };
};

export default useProfilePage;
