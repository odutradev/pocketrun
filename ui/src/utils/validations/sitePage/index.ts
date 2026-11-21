import { z } from "zod";

import { pageAccessPinLength, pageTitleMaxLength } from "@assets/config";
import { slugPattern } from "@utils/validations/link";
import { isWeakPin } from "@utils/functions";

export const pageAccessKeySchema = z.object({
  isRole: z.boolean(),
  hasPin: z.boolean(),
  isPinOptional: z.boolean(),
  role: z.string().trim().toLowerCase().max(64, "Nome muito longo"),
  pin: z.string().trim()
}).superRefine((values, context) => {
  if (values.isRole && !values.role) context.addIssue({ code: "custom", path: ["role"], message: "Dê um nome ao cargo" });
  else if (values.isRole && !slugPattern.test(values.role)) context.addIssue({ code: "custom", path: ["role"], message: "Use só letras minúsculas, números e hífen" });
  if (!values.hasPin || (values.isPinOptional && values.pin === "")) return;
  if (!new RegExp(`^[0-9]{${pageAccessPinLength}}$`).test(values.pin)) context.addIssue({ code: "custom", path: ["pin"], message: `Digite os ${pageAccessPinLength} números ou gere um PIN` });
  else if (isWeakPin(values.pin)) context.addIssue({ code: "custom", path: ["pin"], message: "Esse PIN é fácil de adivinhar. Evite números repetidos ou em sequência." });
});

export const pageFormSchema = z
  .object({
    title: z.string().trim().min(1, "Dê um título à página").max(pageTitleMaxLength, `Use até ${pageTitleMaxLength} caracteres`),
    slug: z
      .string()
      .trim()
      .min(1, "Defina um slug ou sorteie um")
      .max(64, "Slug muito longo")
      .regex(slugPattern, "Use só letras minúsculas, números e hífen"),
    groupId: z.string(),
    mode: z.enum(["active", "inactive", "period", "clicks"]),
    startsAt: z.string(),
    endsAt: z.string(),
    maxClicks: z.string(),
    countBy: z.enum(["clicks", "visitors"])
  })
  .superRefine((values, context) => {
    if (values.mode === "period") {
      if (!values.endsAt) context.addIssue({ code: "custom", path: ["endsAt"], message: "Defina até quando a página fica no ar" });
      if (values.startsAt && values.endsAt && new Date(values.startsAt) >= new Date(values.endsAt)) {
        context.addIssue({ code: "custom", path: ["endsAt"], message: "O fim precisa ser depois do início" });
      }
    }
    if (values.mode === "clicks" && !(Number.parseInt(values.maxClicks, 10) >= 1)) {
      context.addIssue({ code: "custom", path: ["maxClicks"], message: "O limite precisa ser de pelo menos 1 acesso" });
    }
  });
