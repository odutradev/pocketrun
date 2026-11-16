import type { UseFormReturn } from "@hooks/useForm/types";
import type { setupSchema } from "@utils/validations/auth";

export interface UseSetupPageReturn {
  title: string;
  subtitle: string;
  form: UseFormReturn<typeof setupSchema>;
}
