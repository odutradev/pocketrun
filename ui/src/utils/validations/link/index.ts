import { z } from "zod";

import { linkTitleMaxLength } from "@assets/config";

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    const isWebProtocol = url.protocol === "http:" || url.protocol === "https:";
    const hasHost = url.hostname === "localhost" || /^[^.\s]+(\.[^.\s]+)+$/.test(url.hostname);
    return isWebProtocol && hasHost && !/\s/.test(value);
  } catch {
    return false;
  }
};

export const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const linkFormSchema = z
  .object({
    title: z.string().trim().min(1, "Dê um título ao link").max(linkTitleMaxLength, `Use até ${linkTitleMaxLength} caracteres`),
    slug: z
      .string()
      .trim()
      .min(1, "Defina um slug ou sorteie um")
      .max(64, "Slug muito longo")
      .regex(slugPattern, "Use só letras minúsculas, números e hífen"),
    url: z
      .string()
      .trim()
      .min(1, "Informe a URL de destino")
      .max(2048, "URL muito longa")
      .refine(isValidUrl, "Informe uma URL válida, como https://exemplo.com"),
    groupId: z.string(),
    mode: z.enum(["active", "inactive", "period", "clicks"]),
    startsAt: z.string(),
    endsAt: z.string(),
    maxClicks: z.string(),
    countBy: z.enum(["clicks", "visitors"])
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
  name: z.string().trim().min(1, "Dê um nome ao grupo").max(60, "Nome muito longo"),
  color: z.enum(["gray", "red", "orange", "yellow", "green", "blue", "purple", "pink"]),
  icon: z.enum([
    "stack",
    "bookmark",
    "star",
    "heart",
    "rocket",
    "lightning",
    "globe",
    "chat",
    "calendar",
    "target",
    "archive",
    "backpack",
    "home",
    "person",
    "code",
    "magic"
  ])
});
