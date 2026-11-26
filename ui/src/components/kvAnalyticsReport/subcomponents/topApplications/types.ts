import type { RankedApplication } from "@utils/types/application";

export interface TopApplicationsProps {
  applications: RankedApplication[];
}

export interface TopApplicationBarStyleProps {
  $share: number;
}
