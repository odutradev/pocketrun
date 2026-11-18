import { z } from "zod";

import { pageTitleMaxLength } from "@assets/config";
import { slugPattern } from "@utils/validations/link";

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
    maxClicks: z.string()
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
