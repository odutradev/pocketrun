import type { setupSchema, setupTokenSchema } from "@utils/validations/auth";
import type { UseFormReturn } from "@hooks/useForm/types";

export type SetupPageStep = "token" | "admin";

export interface UseSetupPageReturn {
  step: SetupPageStep;
  tokenForm: UseFormReturn<typeof setupTokenSchema>;
  form: UseFormReturn<typeof setupSchema>;
  handleChangeToken: () => void;
}

export interface SetupStore {
  setupToken: string;
  setSetupToken: (setupToken: string) => void;
  clearSetupToken: () => void;
}
