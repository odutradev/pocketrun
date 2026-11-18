import type { User } from "@utils/types/user";

export interface UseProfilePageReturn {
  user: User | null;
  handleUserUpdated: (user: User) => void;
  handleSignOut: () => Promise<void>;
}
