import type { HTMLAttributes, ReactNode } from "react";

export type CardTone = "default" | "dashed" | "danger";

export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardElement = "div" | "section" | "article" | "aside";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  tone?: CardTone;
  padding?: CardPadding;
  as?: CardElement;
  // Com `to`, o card inteiro vira um link para a rota.
  to?: string;
}
