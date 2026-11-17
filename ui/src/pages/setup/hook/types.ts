import type { setupSchema } from "@utils/validations/auth";
import type { UseFormReturn } from "@hooks/useForm/types";

export interface UseSetupPageReturn {
  form: UseFormReturn<typeof setupSchema>;
}
