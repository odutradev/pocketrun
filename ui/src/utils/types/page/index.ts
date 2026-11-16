import type { Permission } from "@utils/types/user";

export interface PageMetadata {
  title: string;
  center?: boolean;
  privateRoute?: boolean;
  publicOnly?: boolean;
  requiredPermissions?: Permission[];
}
