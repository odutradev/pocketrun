import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(128, "A senha deve ter no máximo 128 caracteres")
  .regex(/\p{L}/u, "A senha deve conter ao menos uma letra")
  .regex(/[\p{N}\p{P}\p{S}]/u, "A senha deve conter ao menos um número ou símbolo");

export const signInSchema = z.object({
  email: z.string().trim().min(1, "E-mail é obrigatório").email("Informe um e-mail válido"),
  password: z.string().min(1, "Senha é obrigatória")
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().min(1, "E-mail é obrigatório").email("Informe um e-mail válido"),
  password: passwordSchema
});

export const setupSchema = signUpSchema
  .extend({ confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
  });
