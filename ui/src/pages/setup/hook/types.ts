import type { UseFormReturn } from "@hooks/useForm/types";
import type { setupSchema } from "@utils/validations/auth";

export interface UseSetupPageReturn {
  form: UseFormReturn<typeof setupSchema>;
}
