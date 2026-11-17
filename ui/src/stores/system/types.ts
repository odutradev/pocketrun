import type { Permission, UserRole } from "@utils/types/user";
import type { ApiHealthStatus } from "@utils/types/api";

export interface SystemStore {
  apiStatus: ApiHealthStatus;
  isSetupRequired: boolean | null;
  setApiStatus: (apiStatus: ApiHealthStatus) => void;
  setSetupRequired: (isSetupRequired: boolean) => void;
  hasPermissions: (role: UserRole | undefined, required: Permission[]) => boolean;
}
