import type { Card } from "@radix-ui/themes";
import type { ComponentProps } from "react";

export type CardTone = "default" | "dashed" | "danger" | "interactive";

export interface CardProps extends ComponentProps<typeof Card> {
  tone?: CardTone;
}
