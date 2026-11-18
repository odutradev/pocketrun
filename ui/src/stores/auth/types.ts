import type { Session, User } from "@utils/types/user";

export interface AuthStore {
  user: User | null;
  setSession: (session: Session) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}
