import type { PageMetadata } from "@utils/types/page";

// A aplicação abre na ferramenta Dados: topo, logo, aba ativa, ação principal e foco em azul.
const metadata: PageMetadata = {
  context: "data",
  privateRoute: true,
  requiredPermissions: ["manage_apps"]
};

export default metadata;
