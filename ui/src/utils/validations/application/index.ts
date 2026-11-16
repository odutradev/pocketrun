import { z } from "zod";

export const createApplicationSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  projectId: z
    .string()
    .trim()
    .min(1, "Project ID é obrigatório")
    .max(64, "Project ID muito longo")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  origins: z.string(),
  description: z.string().max(500, "Descrição muito longa")
});

export const securitySettingsSchema = z.object({
  origins: z.string(),
  allowNonBrowserRequests: z.boolean()
});

export const createTokenSchema = z.object({
  name: z.string().trim().min(1, "Identificador é obrigatório").max(100, "Identificador muito longo"),
  validityDays: z.number().int().min(0).max(3650)
});

export type CreateApplicationValues = z.infer<typeof createApplicationSchema>;
export type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;
export type CreateTokenValues = z.infer<typeof createTokenSchema>;
