import type { Application } from "@utils/types/application";

export interface UseKvPageReturn {
  applications: Application[];
  isLoading: boolean;
  loadApplications: () => Promise<void>;
}
