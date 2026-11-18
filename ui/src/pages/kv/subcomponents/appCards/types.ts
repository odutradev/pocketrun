import type { Application } from "@utils/types/application";
import type { AppColumnsOptions } from "../../types";

export interface AppCardsProps extends AppColumnsOptions {
  applications: Application[];
  isCompact?: boolean;
}
