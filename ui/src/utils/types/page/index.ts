import type { BrandContext } from "@utils/types/brand";
import type { Permission } from "@utils/types/user";

// "panel" mostra a barra superior; "bare" é a tela inteira, usada no login e no setup.
export type PageLayout = "panel" | "bare";

// A aba do navegador mostra sempre "PocketRun" (index.html); a página não troca o título.
export interface PageMetadata {
  layout?: PageLayout;
  // Ferramenta da tela; muda as cores dos cinco pontos de contexto.
  context?: BrandContext;
  privateRoute?: boolean;
  publicOnly?: boolean;
  requiredPermissions?: Permission[];
}
