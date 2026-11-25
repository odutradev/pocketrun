import type { KvRole, RoleFormValues } from "@utils/types/application";

export interface KvRoleFormProps {
  role: KvRole | null;
  onSubmit: (values: RoleFormValues) => Promise<unknown>;
  onCancel: () => void;
}

export interface OperationChipStyleProps {
  $isActive: boolean;
}
