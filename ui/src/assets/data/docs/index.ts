import type { DocGroup, DocSectionEntry } from "@utils/types/docs";

export const docsLlmsPath = "/llms.txt";

export const docGroups: DocGroup[] = [
  { id: "general", label: "Geral", context: "general" },
  { id: "kv", label: "KV", context: "data" },
  { id: "pages", label: "Páginas", context: "content" },
  { id: "links", label: "Links", context: "links" },
  { id: "admin", label: "Painel", context: "general" }
];

export const docSections: DocSectionEntry[] = [
  { id: "overview", label: "Visão geral", group: "general" },
  { id: "panel", label: "Usando o painel", group: "general" },
  { id: "kv", label: "O que é o KV", group: "kv" },
  { id: "auth", label: "Autenticação", group: "kv" },
  { id: "routes", label: "Rotas", group: "kv" },
  { id: "create", label: "Gravar", group: "kv" },
  { id: "list", label: "Listar e filtrar", group: "kv" },
  { id: "documents", label: "Ler, atualizar e apagar", group: "kv" },
  { id: "aggregate", label: "Contar e calcular", group: "kv" },
  { id: "transfer", label: "Importar e exportar", group: "kv" },
  { id: "expiry", label: "Validade", group: "kv" },
  { id: "roles", label: "Cargos", group: "kv" },
  { id: "errors", label: "Erros", group: "kv" },
  { id: "security", label: "Segurança", group: "kv" },
  { id: "pages", label: "O que são as páginas", group: "pages" },
  { id: "editor", label: "Editor e versões", group: "pages" },
  { id: "access", label: "Acesso com PIN", group: "pages" },
  { id: "page-data", label: "Dados com pocketrun.kv", group: "pages" },
  { id: "example", label: "Página de exemplo", group: "pages" },
  { id: "links", label: "O que são os links", group: "links" },
  { id: "activation", label: "Ativação e limites", group: "links" },
  { id: "analytics", label: "Análise de acessos", group: "links" },
  { id: "users", label: "Usuários e sessões", group: "admin" },
  { id: "backup", label: "Backup", group: "admin" },
  { id: "llms", label: "llms.txt", group: "admin" }
];
