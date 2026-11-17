export type ExpiryState = "none" | "active" | "soon" | "expired";

export interface ExpiryInfo {
  state: ExpiryState;
  days?: number;
}
