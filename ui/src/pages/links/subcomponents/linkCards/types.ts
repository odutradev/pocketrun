import type { LinkColumnsOptions } from "../../types";
import type { Link } from "@utils/types/link";

export interface LinkCardsProps extends LinkColumnsOptions {
  links: Link[];
  isCompact?: boolean;
}
