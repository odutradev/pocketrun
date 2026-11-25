import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(60, "Nome muito longo"),
  scope: z.enum(["read", "write", "full"])
});
