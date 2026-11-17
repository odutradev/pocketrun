import type { User } from "@utils/types/user";

export interface UserColumnsOptions {
  currentUserId: string | undefined;
  onEdit: (user: User) => void;
  onRemove: (user: User) => void;
}
