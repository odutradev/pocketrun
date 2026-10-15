import type { AuthResponse } from '@projectTypes/application'
import type { ManagerUser } from '@projectTypes/user'

export interface SignInPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  name: string
  email: string
  password: string
}

export type { AuthResponse, ManagerUser }
