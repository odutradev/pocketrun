import type { PageMetadata } from "@utils/types/page";
import type { ReactNode } from "react";

export interface RouteGuardProps {
  metadata: PageMetadata;
  children: ReactNode;
}
