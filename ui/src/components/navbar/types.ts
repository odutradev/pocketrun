export type ApiHealthStatus = "online" | "offline";

export interface NavbarProps {
  apiStatus: ApiHealthStatus;
  setupRequired: boolean;
}
