// "pill" é o selo da barra superior; "panel" é a linha com o endereço, no login e no setup.
export type ApiStatusVariant = "pill" | "panel";

export interface ApiStatusProps {
  variant?: ApiStatusVariant;
}
