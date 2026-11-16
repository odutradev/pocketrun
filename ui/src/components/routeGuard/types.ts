import type { ReactNode } from "react";

import type { PageMetadata } from "@utils/types/page";

export interface RouteGuardProps {
  metadata: PageMetadata;
  children: ReactNode;
}
