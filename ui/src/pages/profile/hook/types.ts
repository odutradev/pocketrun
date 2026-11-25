import type { AdminApiKey } from "@utils/types/apiKey";
import type { User } from "@utils/types/user";

export interface ProfileStore {
  apiKeys: AdminApiKey[];
  isLoadingApiKeys: boolean;
  loadApiKeys: () => Promise<void>;
}

export interface UseProfilePageReturn {
  user: User | null;
  apiKeys: AdminApiKey[];
  isLoadingApiKeys: boolean;
  loadApiKeys: () => Promise<void>;
  handleUserUpdated: (user: User) => void;
  handleSignOut: () => Promise<void>;
}
