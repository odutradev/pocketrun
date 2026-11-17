import type { signInSchema, signUpSchema, setupSchema } from "@utils/validations/auth";
import type { z } from "zod";

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type SetupValues = z.infer<typeof setupSchema>;
