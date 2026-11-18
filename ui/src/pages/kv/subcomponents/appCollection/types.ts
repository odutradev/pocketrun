import type { Application } from "@utils/types/application";

export interface AppCollectionProps {
  applications: Application[];
  total: number;
  caption: string;
}
