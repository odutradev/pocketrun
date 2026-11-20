import { z } from "zod";

export const originSchema = z
  .string()
  .trim()
  .regex(/^https?:\/\/[^\s/]+$/, "Use o formato https://app.exemplo.com, sem caminho nem barra no final");

export const applicationFormSchema = z
  .object({
    name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
    projectId: z
      .string()
      .trim()
      .min(1, "Project ID é obrigatório")
      .max(64, "Project ID muito longo")
      .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
    description: z.string().max(500, "Descrição muito longa"),
    origins: z.array(z.string()),
    allowAnyOrigin: z.boolean(),
    allowNonBrowserRequests: z.boolean()
  })
  .refine((values) => values.allowAnyOrigin || values.origins.length > 0, {
    message: "Adicione ao menos uma origem ou ligue a origem global",
    path: ["origins"]
  });

export const createTokenSchema = z.object({
  name: z.string().trim().min(1, "Identificador é obrigatório").max(100, "Identificador muito longo"),
  validityDays: z.number().int().min(0).max(3650),
  role: z.string().min(1, "Escolha um cargo")
});

export const roleRuleSchema = z.object({
  collection: z
    .string()
    .trim()
    .regex(/^(\*|[A-Za-z0-9_-]{1,64})$/, "Coleção: use letras, números, _ e -, ou * para todas"),
  operations: z.array(z.enum(["read", "create", "update", "delete"])).min(1, "Cada regra precisa de ao menos uma operação"),
  maxDocuments: z.number().int("O limite precisa ser um número inteiro").min(0, "O limite não pode ser negativo").max(1000000, "Limite muito alto")
});

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(40, "Nome muito longo")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífen, como caixa ou leitura-1")
    .refine((name) => name !== "admin", "admin é o cargo de acesso total e já existe"),
  description: z.string().trim().max(200, "Descrição muito longa"),
  isOwnDocumentsOnly: z.boolean(),
  rules: z
    .array(roleRuleSchema)
    .min(1, "Adicione ao menos uma regra")
    .max(30, "Use no máximo 30 regras")
    .refine((rules) => new Set(rules.map((rule) => rule.collection.trim())).size === rules.length, "Cada coleção aparece em uma regra só")
});
