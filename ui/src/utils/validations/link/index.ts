import { z } from "zod";

export const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const linkFormSchema = z
  .object({
    title: z.string().trim().min(1, "Dê um título ao link").max(120, "Título muito longo"),
    slug: z
      .string()
      .trim()
      .max(64, "Slug muito longo")
      .refine((slug) => slug === "" || slugPattern.test(slug), "Use só letras minúsculas, números e hífen"),
    url: z
      .string()
      .trim()
      .min(1, "Informe a URL de destino")
      .max(2048, "URL muito longa")
      .regex(/^https?:\/\/\S+$/i, "Use uma URL completa, começando com http:// ou https://"),
    groupId: z.string(),
    mode: z.enum(["active", "inactive", "period", "clicks"]),
    startsAt: z.string(),
    endsAt: z.string(),
    maxClicks: z.string()
  })
  .superRefine((values, context) => {
    if (values.mode === "period") {
      if (!values.endsAt) context.addIssue({ code: "custom", path: ["endsAt"], message: "Defina até quando o link fica ativo" });
      if (values.startsAt && values.endsAt && new Date(values.startsAt) >= new Date(values.endsAt)) {
        context.addIssue({ code: "custom", path: ["endsAt"], message: "O fim precisa ser depois do início" });
      }
    }
    if (values.mode === "clicks" && !(Number.parseInt(values.maxClicks, 10) >= 1)) {
      context.addIssue({ code: "custom", path: ["maxClicks"], message: "O limite precisa ser de pelo menos 1 acesso" });
    }
  });

export const linkGroupSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao grupo").max(60, "Nome muito longo")
});
