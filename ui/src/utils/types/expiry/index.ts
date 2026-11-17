export type ExpiryState = "none" | "active" | "soon" | "expired";

export interface ExpiryInfo {
  state: ExpiryState;
  // Dias até expirar; só existe quando há data de expiração.
  days?: number;
}
