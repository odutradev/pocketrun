export type UserRole = "superadmin" | "admin";

export type Permission = "manage_apps";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  token: string;
  user: User;
}

export interface SetupStatus {
  setupRequired: boolean;
  hasUsers: boolean;
}
