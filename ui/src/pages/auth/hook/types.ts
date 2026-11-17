export type AuthMode = "login" | "register";

export interface UseAuthPageReturn {
  mode: AuthMode;
  handleModeChange: (mode: AuthMode) => void;
  handleSuccess: () => void;
}
