// "pill" é o selo com texto; "panel" é a linha com o endereço, no login e no setup;
// "dot" é só o ponto pulsando, com endereço e versão no tooltip, ao lado da logo do menu.
export type ApiStatusVariant = "pill" | "panel" | "dot";

export interface ApiStatusProps {
  variant?: ApiStatusVariant;
}
