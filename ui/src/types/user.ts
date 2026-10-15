export type UserRole = 'superadmin' | 'admin' | 'user' | string

export interface UserProfile {
  id: string
  name: string
  email: string
  role?: UserRole
  created_at: string
}

export type ManagerUser = UserProfile
