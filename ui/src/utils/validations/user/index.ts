import { z } from "zod";

import { passwordSchema } from "@utils/validations/auth";

const nameSchema = z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo");
const emailSchema = z.string().trim().min(1, "E-mail é obrigatório").email("Informe um e-mail válido");
const roleSchema = z.enum(["superadmin", "admin"]);

// Na edição a senha é opcional: vazia, o usuário continua com a atual.
export const userFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: roleSchema,
  password: z.union([z.literal(""), passwordSchema])
});

// Na criação a senha inicial é obrigatória.
export const newUserFormSchema = userFormSchema.refine((values) => values.password !== "", {
  message: "Defina uma senha inicial",
  path: ["password"]
});

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
  });

export type UserFormValues = z.infer<typeof userFormSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ChangePasswordPayload = Omit<ChangePasswordValues, "confirmPassword">;
