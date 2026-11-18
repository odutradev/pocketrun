import type { userFormSchema, profileSchema, changePasswordSchema } from "@utils/validations/user";
import type { z } from "zod";

export type UserRole = "superadmin" | "admin";

export type Permission = "manage_apps" | "manage_users";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
}

export interface SetupStatus {
  setupRequired: boolean;
  hasUsers: boolean;
}

export type UserFormValues = z.infer<typeof userFormSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ChangePasswordPayload = Omit<ChangePasswordValues, "confirmPassword">;
