import { ArchiveIcon, BackpackIcon, BookmarkIcon, CalendarIcon, ChatBubbleIcon, CodeIcon, GlobeIcon, HeartIcon, HomeIcon, LightningBoltIcon, MagicWandIcon, PersonIcon, RocketIcon, StackIcon, StarIcon, TargetIcon } from "@radix-ui/react-icons";

import theme from "@styles/theme";

import type { BrandColor, BrandContext, BrandOption, BrandSection, BrandToken, BrandToolInfo, BrandTypeStep, FaviconItem, IconPaletteInfo, LogoAspect, LogoBackground, LogoConfig, LogoKind, LogoPalette, MotionDemo, MotionToken, OpticalSize, QuickKitItem, RasterFormat, RasterSize, SymbolPart, TypeFamily } from "@utils/types/brand";
import type { PageChangeField, PageEditorTab, PageEventType, PageGroupTab } from "@utils/types/sitePage";
import type { AnalyticsRange, GroupColorOption, GroupIconOption, HistoryFilter, LinkChangeField, LinkEditorTab, LinkEventType, LinkGroupTab, LinkMode, LinkSort, LinkState, LinkStateFilter, PeriodPresetOption, QrLevel, QrMargin, QrSize, SlugUnavailableReason, UrlProtocolOption } from "@utils/types/link";
import type { Permission, UserRole } from "@utils/types/user";
import type { BadgeTone } from "@components/badge/types";
import type { ApiErrorCode } from "@utils/types/api";

const { brand, motion } = theme;

export const errorMessages: Record<ApiErrorCode, string> = {
  validation_failed: "Alguns campos estão inválidos.",
  invalid_body: "Requisição inválida.",
  internal_error: "Erro interno no servidor. Tente novamente.",
  network_error: "Não foi possível conectar à API.",
  missing_authorization: "Sessão não encontrada. Entre novamente.",
  invalid_authorization: "Sessão inválida. Entre novamente.",
  invalid_token: "Sessão expirada. Entre novamente.",
  invalid_credentials: "E-mail ou senha inválidos.",
  setup_completed: "A configuração inicial já foi concluída.",
  user_not_found: "Usuário não encontrado.",
  email_taken: "Este e-mail já está em uso.",
  invalid_application_id: "Aplicação inválida.",
  application_not_found: "Aplicação não encontrada.",
  token_not_found: "Token não encontrado.",
  project_id_taken: "Este Project ID já está em uso.",
  forbidden: "Sua conta não tem permissão para esta ação.",
  invalid_user_id: "Usuário inválido.",
  self_action_forbidden: "Você não pode mudar o próprio cargo nem remover a própria conta.",
  user_has_applications: "Este usuário ainda tem aplicações. Remova-as antes de excluir a conta.",
  invalid_current_password: "A senha atual está incorreta.",
  invalid_link_id: "Link inválido.",
  invalid_page_id: "Página inválida.",
  page_not_found: "Página não encontrada.",
  page_too_large: "O HTML passou do limite de tamanho da página.",
  invalid_version: "Versão inválida.",
  version_not_found: "Versão não encontrada.",
  link_not_found: "Link não encontrado.",
  invalid_group_id: "Grupo inválido.",
  group_not_found: "Grupo não encontrado.",
  group_name_taken: "Já existe um grupo com esse nome.",
  invalid_schedule: "A regra de ativação está incompleta.",
  invalid_slug: "Use só letras minúsculas, números e hífen no slug.",
  reserved_slug: "Esse slug é reservado pelo sistema.",
  slug_taken: "Esse slug já está em uso.",
  self_redirect: "O destino não pode ser um endereço deste encurtador, senão o link redireciona para ele mesmo.",
  invalid_key_id: "PIN inválido.",
  invalid_pin: "O PIN precisa ter 6 números.",
  weak_pin: "Esse PIN é fácil de adivinhar. Evite números repetidos ou em sequência.",
  invalid_role: "Use só letras minúsculas, números e hífen no nome do cargo.",
  no_access_keys: "Crie um PIN antes de ligar a proteção.",
  last_access_key: "Não dá para apagar o último PIN com a proteção ligada. Desligue a proteção antes.",
  too_many_access_keys: "A página chegou ao limite de PINs.",
  access_key_not_found: "PIN não encontrado.",
  pin_in_use: "Outro cargo desta página já usa esse PIN.",
  role_taken: "Já existe um cargo com esse nome nesta página.",
  access_conflict: "O acesso da página mudou enquanto você editava. Recarregue e tente de novo."
};

export const rolePermissions: Record<UserRole, Permission[]> = {
  superadmin: ["manage_apps", "manage_users"],
  admin: ["manage_apps"]
};

export const roleLabels: Record<UserRole, string> = {
  superadmin: "Superadmin",
  admin: "Gestor"
};

export const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Gestor · cria e gerencia as próprias aplicações" },
  { value: "superadmin", label: "Superadmin · também gerencia os usuários" }
];

export const tokenValidityOptions = [
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias (3 meses)" },
  { value: 180, label: "180 dias (6 meses)" },
  { value: 365, label: "365 dias (1 ano)" },
  { value: 1095, label: "3 anos" }
] as const;

export const defaultTokenValidity = 365;

export const brandSections: BrandSection[] = [
  { id: "conceito", number: "01", label: "Conceito" },
  { id: "simbolo", number: "02", label: "Símbolo" },
  { id: "logotipo", number: "03", label: "Logotipo" },
  { id: "cores", number: "04", label: "Cores" },
  { id: "tipografia", number: "05", label: "Tipografia" },
  { id: "icone", number: "06", label: "Ícone" },
  { id: "ferramentas", number: "07", label: "Ferramentas" },
  { id: "usos", number: "08", label: "Usos" },
  { id: "movimento", number: "09", label: "Movimento" },
  { id: "downloads", number: "10", label: "Downloads" }
];

export const brandContextOptions: BrandOption<BrandContext>[] = [
  { value: "general", label: "Geral", description: "Início, login, configurações e materiais da marca." },
  { value: "data", label: "Dados", description: "Dentro de Dados, lâminas e RUN ficam azuis." },
  { value: "content", label: "Conteúdos", description: "Dentro de Conteúdos, lâminas e RUN ficam em latão." },
  { value: "links", label: "Links", description: "Dentro de Links, lâminas e RUN ficam em oliva." }
];

export const brandPersonality = [
  { title: "Prática", description: "Uma ferramenta de bolso: resolve o backend e sai da frente do seu projeto." },
  { title: "Sua", description: "Self-hosted. Roda no seu servidor, com os seus dados, sem depender de ninguém." },
  { title: "Versátil", description: "Dados, conteúdos e links no mesmo cabo. Você abre só a lâmina que precisa." },
  { title: "Brasileira", description: "Nome curto e global, com interface e tom em português." }
];

export const brandSymbolParts: SymbolPart[] = [
  {
    number: "01",
    name: "Cabo · a instância",
    spec: "74 × 20 · rebite r 4,5 em (24, 70)",
    description: "Um PocketRun só, no seu servidor. É de onde tudo sai, por isso é neutro e nunca muda: aço no escuro, tinta no claro."
  },
  {
    number: "02",
    name: "Lâmina longa · Dados",
    spec: "60 × 12 · −22°",
    description: "O coração do produto: coleções de JSON. A maior lâmina, em azul anodizado.",
    tool: "data"
  },
  {
    number: "03",
    name: "Lâmina do meio · Conteúdos",
    spec: "54 × 12 · −52°",
    description: "Micro-páginas em HTML, CSS e JS. Quente e visível como um cartaz, em latão.",
    tool: "content"
  },
  {
    number: "04",
    name: "Lâmina curta · Links",
    spec: "46 × 12 · −82°",
    description: "Links curtos que levam a outro lugar. Verde de caminho, oliva de campo.",
    tool: "links"
  }
];

export const brandOpticalSizes: OpticalSize[] = [
  { size: 64, variant: "full", label: "64 px ou mais · desenho completo, com rebite" },
  { size: 32, variant: "bold", label: "24 a 48 px · lâminas e cabo mais grossos" },
  { size: 16, variant: "tiny", label: "16 px · o cabo vira um círculo" }
];

export const brandIconPalettes: IconPaletteInfo[] = [
  { palette: "dark", name: "Grafite (principal)", description: "Favicon, ícone do app, PWA e avatar da organização." },
  { palette: "light", name: "Papel", description: "Documentação e materiais em fundo claro." },
  { palette: "monoWhite", name: "Tinta e branco", description: "Carimbos, gravações e peças de uma cor." }
];

export const brandTools: BrandToolInfo[] = [
  {
    tool: "data",
    name: "Dados",
    colorName: "Azul anodizado",
    route: "/kv/:collection",
    status: "live",
    origin: "O antigo PocketDB",
    description: "Coleções de JSON livre, com filtros, paginação e validade por documento."
  },
  {
    tool: "content",
    name: "Conteúdos",
    colorName: "Latão",
    route: "/:slug",
    status: "planned",
    origin: "Vem do Shareds",
    description: "Micro-páginas em HTML, CSS e JS, com editor no painel e métricas de acesso."
  },
  {
    tool: "links",
    name: "Links",
    colorName: "Oliva de campo",
    route: "/:slug",
    status: "live",
    origin: "Vem do Shareds",
    description: "Links curtos que redirecionam para qualquer endereço, com contagem de acessos."
  }
];

export const brandToolColors: BrandColor[] = [
  {
    name: "Azul anodizado",
    hex: brand.tools.data.base,
    token: "--pr-data",
    role: "Dados · indigo-9",
    description: "Dados é a parte que não pode falhar. O azul passa confiança e cara de infraestrutura."
  },
  {
    name: "Latão",
    hex: brand.tools.content.base,
    token: "--pr-content",
    role: "Conteúdos · amber-9",
    description: "Conteúdos é o que aparece para o mundo. Quente e chamativo como um cartaz, artesanal como HTML escrito à mão."
  },
  {
    name: "Oliva de campo",
    hex: brand.tools.links.base,
    token: "--pr-links",
    role: "Links · grass-9",
    description: "Links levam a pessoa para outro lugar. Verde de caminho e de “pode ir”, robusto como o canivete."
  }
];

export const brandNeutralColors: BrandColor[] = [
  {
    name: "Grafite",
    hex: brand.graphite,
    token: "--pr-bg",
    role: "Fundo escuro · gray-1",
    description: "Base do tema escuro. Cinza puro, sem tom, para não puxar nenhuma das três cores."
  },
  {
    name: "Superfície",
    hex: brand.surface,
    token: "--pr-surface",
    role: "Cards e painéis · gray-2",
    description: "Um degrau acima do fundo para separar áreas sem bordas fortes."
  },
  {
    name: "Aço",
    hex: brand.steel,
    token: "--pr-text",
    role: "Texto e cabo · gray-12",
    description: "Texto principal, cabo do símbolo e botões globais no tema escuro."
  },
  {
    name: "Aço escovado",
    hex: brand.steelMuted,
    token: "--pr-text-muted",
    role: "Texto suave · gray-11",
    description: "Rótulos, descrições e itens inativos."
  },
  {
    name: "Papel",
    hex: brand.paper,
    token: "--pr-bg (claro)",
    role: "Fundo claro · gray-1",
    description: "Base do tema claro e dos materiais impressos."
  },
  {
    name: "Tinta",
    hex: brand.ink,
    token: "--pr-text (claro)",
    role: "Texto e cabo no claro · gray-12",
    description: "Texto, cabo e botões globais sobre fundo claro."
  }
];

export const brandStateColors: BrandColor[] = [
  {
    name: "Sucesso",
    hex: brand.states.success,
    token: "--pr-success",
    role: "teal-9",
    description: "Verde-azulado, longe do oliva de Links. Também marca a API no ar."
  },
  {
    name: "Aviso",
    hex: brand.states.warning,
    token: "--pr-warning",
    role: "orange-9",
    description: "Laranja, para não se misturar com o latão de Conteúdos."
  },
  {
    name: "Erro",
    hex: brand.states.error,
    token: "--pr-error",
    role: "red-9",
    description: "Vermelho puro, sem concorrência na paleta."
  }
];

export const brandTokens: BrandToken[] = [
  { token: "--pr-bg", dark: brand.graphite, light: brand.paper },
  { token: "--pr-surface", dark: brand.surface, light: brand.white },
  { token: "--pr-surface-2", dark: brand.raised, light: brand.paperRaised },
  { token: "--pr-border", dark: brand.border, light: brand.paperBorder },
  { token: "--pr-text", dark: brand.steel, light: brand.ink },
  { token: "--pr-text-muted", dark: brand.steelMuted, light: brand.inkMuted },
  { token: "--pr-data", dark: brand.tools.data.text, light: brand.tools.data.textOnLight },
  { token: "--pr-content", dark: brand.tools.content.text, light: brand.tools.content.textOnLight },
  { token: "--pr-links", dark: brand.tools.links.text, light: brand.tools.links.textOnLight }
];

export const brandTypeFamilies: { family: TypeFamily; name: string; role: string; description: string; weights: number[] }[] = [
  {
    family: "display",
    name: "Unbounded",
    role: "Logotipo, títulos e números",
    description: "Larga e geométrica: ocupa espaço com confiança, como um nome gravado no cabo. Sempre em 700 ou 800.",
    weights: [500, 700, 800]
  },
  {
    family: "body",
    name: "Hanken Grotesk",
    role: "Interface e textos",
    description: "Neutra e legível, equilibra a largura da Unbounded. 400 para leitura, 600 para rótulos e botões.",
    weights: [400, 500, 600, 700]
  },
  {
    family: "mono",
    name: "Space Mono",
    role: "Código, rotas e tokens",
    description: "Monoespaçada com personalidade, combina com o desenho geométrico da Unbounded.",
    weights: [400, 700]
  }
];

export const brandTypeScale: BrandTypeStep[] = [
  { label: "Display · 56 / 1.0 · 800", family: "display", size: 56, lineHeight: 1, weight: 800, sample: "POCKETRUN" },
  { label: "Título 1 · 32 / 1.1 · 800", family: "display", size: 32, lineHeight: 1.1, weight: 800, sample: "Suas aplicações" },
  { label: "Título 2 · 20 / 1.2 · 700", family: "display", size: 20, lineHeight: 1.2, weight: 700, sample: "Chaves de acesso" },
  {
    label: "Rótulo · 12 · 800 · +14%",
    family: "display",
    size: 12,
    lineHeight: 1.2,
    weight: 800,
    sample: "Coleções",
    uppercase: true
  },
  {
    label: "Corpo · 16 / 1.55 · 400",
    family: "body",
    size: 16,
    lineHeight: 1.55,
    weight: 400,
    sample: "Tokens, CORS e dados isolados por projeto, sem escrever servidor."
  },
  { label: "Pequeno · 14 / 1.45 · 500", family: "body", size: 14, lineHeight: 1.45, weight: 500, sample: "Chave usada há 2 min" },
  { label: "Código · 14 / 1.7 · 400", family: "mono", size: 14, lineHeight: 1.7, weight: 400, sample: "GET /kv/tasks/get-all" }
];

export const brandUsageRules = [
  {
    title: "Área de proteção",
    description: "Deixe livre em volta da marca um espaço igual à altura do cabo do símbolo. Nada de texto, borda ou imagem dentro dela."
  },
  {
    title: "Tamanho mínimo",
    description: "Logo horizontal com 120 px de largura. Abaixo de 48 px de altura use o ícone do app; abaixo de 24 px, a versão de favicon."
  },
  {
    title: "Contexto",
    description: "No geral, o RUN usa as três cores. Dentro de uma ferramenta, as três lâminas e o RUN ficam da cor dela. O cabo é sempre aço ou tinta."
  },
  {
    title: "Escrita do nome",
    description: "No logotipo, sempre POCKETRUN em caixa alta. Em texto corrido, PocketRun, junto e com P e R maiúsculos."
  }
];

export const brandDonts = [
  "Não troque a ordem das cores: azul, latão e oliva",
  "Não pinte o cabo com uma das cores das ferramentas",
  "Não misture contextos: lâminas de uma cor e RUN de outra",
  "Não use o RUN de três cores dentro de uma ferramenta",
  "Não aplique sombra, brilho ou gradiente",
  "Não escreva Pocket Run nem pocketRun"
];

export const logoKindOptions: BrandOption<LogoKind>[] = [
  { value: "horizontal", label: "Horizontal (símbolo + nome)", description: "Versão principal: navbar, site, README e assinaturas." },
  { value: "stacked", label: "Empilhada", description: "Para espaços estreitos e verticais: capas, crachás e totens." },
  { value: "symbol", label: "Símbolo", description: "Só o canivete: avatares, carimbos e elementos gráficos." },
  { value: "wordmark", label: "Logotipo (só o nome)", description: "Quando o símbolo já aparece por perto." },
  { value: "appIcon", label: "Ícone do app", description: "O símbolo num bloco de cantos arredondados: favicon, PWA e perfis." }
];

export const logoPaletteOptions: BrandOption<LogoPalette>[] = [
  { value: "dark", label: "Padrão escuro", description: "Cabo e nome em aço, para fundos escuros." },
  { value: "light", label: "Padrão claro", description: "Cabo e nome em tinta, para fundos claros." },
  { value: "monoWhite", label: "Monocromático branco", description: "100% branco. Marca d'água para fotos e vídeos." },
  { value: "monoInk", label: "Monocromático tinta", description: "100% tinta. Para documentos e impressão em 1 cor." }
];

export const logoBackgroundOptions: BrandOption<LogoBackground>[] = [
  { value: "transparent", label: "Transparente" },
  { value: "graphite", label: `Grafite ${brand.graphite}` },
  { value: "paper", label: `Papel ${brand.paper}` },
  { value: "white", label: `Branco ${brand.white}` }
];

export const logoAspectOptions: BrandOption<LogoAspect>[] = [
  { value: "original", label: "Original (recorte justo)" },
  { value: "1:1", label: "1:1 · avatar e post" },
  { value: "4:5", label: "4:5 · feed vertical" },
  { value: "16:9", label: "16:9 · tela e vídeo" },
  { value: "1.91:1", label: "1,91:1 · link e Open Graph" },
  { value: "9:16", label: "9:16 · stories" },
  { value: "3:1", label: "3:1 · banner e capa" }
];

export const rasterSizeOptions: BrandOption<RasterSize>[] = [
  { value: 512, label: "512 px no lado maior" },
  { value: 1024, label: "1024 px no lado maior" },
  { value: 2048, label: "2048 px no lado maior" },
  { value: 4096, label: "4096 px no lado maior" }
];

export const rasterFormatOptions: BrandOption<RasterFormat>[] = [
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "jpg", label: "JPG" }
];

export const brandFaviconPack: FaviconItem[] = [
  { fileName: "favicon.svg", size: 512, format: "svg", usage: "Navegadores modernos" },
  { fileName: "favicon-16.png", size: 16, format: "png", usage: "Aba do navegador" },
  { fileName: "favicon-32.png", size: 32, format: "png", usage: "Aba em telas retina" },
  { fileName: "favicon-48.png", size: 48, format: "png", usage: "Atalhos do Windows" },
  { fileName: "apple-touch-icon.png", size: 180, format: "png", usage: "Tela inicial do iOS" },
  { fileName: "icon-192.png", size: 192, format: "png", usage: "PWA e Android" },
  { fileName: "icon-512.png", size: 512, format: "png", usage: "PWA e lojas" }
];

export const defaultLogoConfig: LogoConfig = {
  kind: "horizontal",
  context: "general",
  palette: "dark",
  background: "transparent",
  aspect: "original",
  size: 2048,
  format: "png"
};

export const brandQuickKit: QuickKitItem[] = [
  {
    id: "horizontal-dark",
    title: "Logo horizontal · escuro",
    description: "Aço e as três cores sobre transparente. Para o tema escuro e telas.",
    config: { ...defaultLogoConfig }
  },
  {
    id: "horizontal-light",
    title: "Logo horizontal · claro",
    description: "Tinta e as três cores sobre transparente. Para web e peças claras.",
    config: { ...defaultLogoConfig, palette: "light" }
  },
  {
    id: "stacked-dark",
    title: "Logo empilhada · escuro",
    description: "Para capas e espaços estreitos em fundo escuro.",
    config: { ...defaultLogoConfig, kind: "stacked" }
  },
  {
    id: "symbol-dark",
    title: "Símbolo · escuro",
    description: "O canivete sozinho, para fundos escuros.",
    config: { ...defaultLogoConfig, kind: "symbol", size: 1024 }
  },
  {
    id: "app-icon",
    title: "Ícone do app",
    description: "Bloco grafite 1:1, para GitHub, npm, PWA e redes sociais.",
    config: { ...defaultLogoConfig, kind: "appIcon", size: 1024 }
  },
  {
    id: "mono-white",
    title: "Monocromático branco",
    description: "100% branco. Marca d'água para fotos e vídeos.",
    config: { ...defaultLogoConfig, palette: "monoWhite" }
  },
  {
    id: "mono-ink",
    title: "Monocromático tinta",
    description: "100% tinta. Para documentos e impressão em 1 cor.",
    config: { ...defaultLogoConfig, palette: "monoInk" }
  },
  {
    id: "social-card",
    title: "Card social · escuro",
    description: "1,91:1 sobre grafite. Para links, posts e Open Graph.",
    config: { ...defaultLogoConfig, aspect: "1.91:1", background: "graphite", size: 1024 }
  }
];

export const brandMotionTokens: MotionToken[] = [
  { token: "motion.fast", value: `${motion.fast}ms`, usage: "Hover, foco e troca de cor" },
  { token: "motion.base", value: `${motion.base}ms`, usage: "Fechar lâmina e mudar de estado" },
  { token: "motion.expressive", value: `${motion.expressive}ms`, usage: "Abrir lâmina e entrada da marca" },
  { token: "motion.stagger", value: `${motion.stagger}ms`, usage: "Intervalo entre lâminas e letras" },
  { token: "motion.easing.snap", value: motion.easing.snap, usage: "Lâmina abrindo e travando: passa do ponto e volta" },
  { token: "motion.easing.standard", value: motion.easing.standard, usage: "Fechar, sair e trocar de cor" }
];

export const brandMotionDemos: MotionDemo[] = [
  {
    id: "intro",
    title: "Abertura do canivete",
    description: "O cabo entra e as lâminas abrem uma a uma, da mais curta para a mais longa, travando com um leve rebote.",
    usage: "Hero do manual, tela de login e abertura do app",
    timing: "560 ms por lâmina, 90 ms entre elas",
    easing: "snap",
    hasReplay: true
  },
  {
    id: "wordmark",
    title: "Logo com RUN sincronizado",
    description: "POCKET sobe letra a letra. Cada letra de RUN acende junto com a lâmina da sua cor: R com Dados, U com Conteúdos e N com Links.",
    usage: "Cabeçalho na primeira carga, vídeos e apresentações",
    timing: "Cerca de 1,2 s no total",
    easing: "standard nas letras, snap nas lâminas",
    hasReplay: true
  },
  {
    id: "loader",
    title: "Loader de lâminas",
    description: "As lâminas abrem e fecham em onda, sem parar. Substitui o spinner genérico e já fala a língua da marca.",
    usage: "Páginas carregando, explorer de documentos e envios",
    timing: "1,4 s por ciclo, 90 ms entre lâminas",
    easing: "standard"
  },
  {
    id: "hover",
    title: "Hover que abre mais",
    description: "Ao passar o mouse ou focar, as lâminas se afastam alguns graus, como se o canivete fosse puxado. Ao sair, voltam ao lugar.",
    usage: "Logo do cabeçalho e atalhos das ferramentas",
    timing: "250 ms para abrir e para voltar",
    easing: "snap na entrada, standard na saída"
  },
  {
    id: "context",
    title: "Troca de contexto",
    description: "Ao mudar de ferramenta, as lâminas fecham, trocam de cor e reabrem. No contexto de uma ferramenta, as três lâminas e o RUN assumem a cor dela.",
    usage: "Seletor de contexto e troca entre módulos do painel",
    timing: "250 ms fechando, 560 ms abrindo",
    easing: "standard, depois snap"
  },
  {
    id: "status",
    title: "Rebite de status",
    description: "Com a API no ar, um anel pulsa a partir do rebite. Quando ela cai, as lâminas se recolhem e o anel fica vermelho: canivete fechado é sistema parado.",
    usage: "Indicador de saúde da API no cabeçalho",
    timing: "Pulso de 2 s, recolhe em 250 ms",
    easing: "standard"
  },
  {
    id: "snap",
    title: "Trava de confirmação",
    description: "Depois de salvar, a lâmina dá um estalo curto, como quem trava o canivete. Discreto o bastante para repetir sempre.",
    usage: "Criar app, gerar token e salvar documento",
    timing: "560 ms",
    easing: "snap"
  },
  {
    id: "appIcon",
    title: "Ícone do app",
    description: "O bloco cresce do centro e o canivete abre dentro dele. Serve de tela de abertura enquanto o app carrega.",
    usage: "Antes do React montar, PWA e vídeos curtos",
    timing: "Cerca de 1 s no total",
    easing: "standard no bloco, snap nas lâminas",
    hasReplay: true
  }
];

export const linkModeOptions: { value: LinkMode; label: string }[] = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Desativado" },
  { value: "period", label: "Por período" },
  { value: "clicks", label: "Por acessos" }
];

export const linkStateLabels: Record<LinkState, { label: string; tone: BadgeTone }> = {
  active: { label: "Ativo", tone: "success" },
  inactive: { label: "Desativado", tone: "neutral" },
  scheduled: { label: "Agendado", tone: "accent" },
  expired: { label: "Expirado", tone: "warning" },
  exhausted: { label: "Esgotado", tone: "warning" }
};

export const slugReasonMessages: Record<SlugUnavailableReason, string> = {
  invalid: "Use só letras minúsculas, números e hífen.",
  reserved: "Esse slug é reservado pelo sistema.",
  taken: "Esse slug já está em uso por outro link ou página."
};

export const periodPresetOptions: PeriodPresetOption[] = [
  { value: "1h", label: "1 hora", hours: 1 },
  { value: "1d", label: "24 horas", hours: 24 },
  { value: "7d", label: "7 dias", hours: 168 },
  { value: "30d", label: "30 dias", hours: 720 },
  { value: "custom", label: "Escolher datas", hours: null }
];

export const urlProtocolOptions: UrlProtocolOption[] = [
  { value: "https", label: "https://" },
  { value: "http", label: "http://" },
  { value: "manual", label: "Manual" }
];

export const linkEditorTabs: { value: LinkEditorTab; label: string }[] = [
  { value: "settings", label: "Configuração" },
  { value: "qrcode", label: "QR code" },
  { value: "analytics", label: "Análise" },
  { value: "history", label: "Histórico" }
];

export const pageEditorTabs: { value: PageEditorTab; label: string }[] = [
  { value: "editor", label: "Editor" },
  { value: "settings", label: "Configuração" },
  { value: "versions", label: "Versões" },
  { value: "access", label: "Acesso" },
  { value: "qrcode", label: "QR code" },
  { value: "analytics", label: "Análise" },
  { value: "history", label: "Histórico" }
];

export const pageGroupTabs: { value: PageGroupTab; label: string }[] = [
  { value: "pages", label: "Páginas" },
  { value: "settings", label: "Configurações" }
];

export const pageEventLabels: Record<PageEventType, string> = {
  created: "criou a página",
  updated: "editou a página",
  deleted: "excluiu a página",
  expired: "encerrou a página no fim do período",
  exhausted: "encerrou a página ao atingir o limite de acessos",
  group_detached: "removeu a página do grupo ao excluir o grupo",
  access_enabled: "ligou a proteção por PIN",
  access_disabled: "desligou a proteção por PIN",
  access_key_created: "criou um PIN",
  access_key_renamed: "renomeou um cargo",
  access_pin_reset: "trocou um PIN",
  access_key_removed: "apagou um PIN",
  access_sessions_revoked: "encerrou os acessos abertos com PIN",
  access_session_changed: "mudou a duração do acesso por PIN",
  access_locked: "bloqueou o PIN da página por excesso de tentativas erradas",
  unlocked: "abriu a página com PIN"
};

export const pageChangeLabels: Record<PageChangeField, string> = {
  title: "Título",
  slug: "Slug",
  version: "Versão do código",
  groupId: "Grupo",
  mode: "Ativação",
  startsAt: "Início",
  endsAt: "Fim",
  maxClicks: "Limite de acessos",
  role: "Cargo",
  sessionHours: "Duração do acesso"
};

export const htmlVoidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

export const htmlOptionalCloseTags = new Set([
  "html",
  "head",
  "body",
  "p",
  "li",
  "dt",
  "dd",
  "option",
  "optgroup",
  "tr",
  "td",
  "th",
  "thead",
  "tbody",
  "tfoot",
  "colgroup",
  "caption",
  "rt",
  "rp"
]);

export const htmlRawTextTags = new Set(["script", "style", "textarea", "title"]);

export const pageStarterHtml = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Minha página</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <main>
    <h1>Olá!</h1>
    <p>Edite o HTML desta página no PocketRun.</p>
  </main>
</body>
</html>
`;

export const linkStateFilterOptions: { value: LinkStateFilter; label: string }[] = [
  { value: "all", label: "Todos os estados" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Desativados" },
  { value: "scheduled", label: "Agendados" },
  { value: "expired", label: "Expirados" },
  { value: "exhausted", label: "Esgotados" }
];

export const linkSortOptions: { value: LinkSort; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "clicks", label: "Mais acessados" },
  { value: "title", label: "Título (A–Z)" },
  { value: "expiring", label: "Perto de expirar" }
];

export const qrSizeOptions: { value: QrSize; label: string }[] = [
  { value: "256", label: "256 px" },
  { value: "512", label: "512 px" },
  { value: "1024", label: "1024 px" },
  { value: "2048", label: "2048 px" }
];

export const qrLevelOptions: { value: QrLevel; label: string }[] = [
  { value: "L", label: "Baixa" },
  { value: "M", label: "Média" },
  { value: "Q", label: "Alta" },
  { value: "H", label: "Máxima" }
];

export const qrMarginOptions: { value: QrMargin; label: string }[] = [
  { value: "0", label: "Sem margem" },
  { value: "2", label: "Pequena" },
  { value: "4", label: "Padrão" }
];

export const linkGroupTabs: { value: LinkGroupTab; label: string }[] = [
  { value: "links", label: "Links" },
  { value: "settings", label: "Configurações" }
];

export const groupColorOptions: GroupColorOption[] = [
  { value: "gray", label: "Cinza" },
  { value: "red", label: "Vermelho" },
  { value: "orange", label: "Laranja" },
  { value: "yellow", label: "Amarelo" },
  { value: "green", label: "Verde" },
  { value: "blue", label: "Azul" },
  { value: "purple", label: "Roxo" },
  { value: "pink", label: "Rosa" }
];

export const groupIconOptions: GroupIconOption[] = [
  { value: "stack", label: "Camadas", icon: StackIcon },
  { value: "bookmark", label: "Marcador", icon: BookmarkIcon },
  { value: "star", label: "Estrela", icon: StarIcon },
  { value: "heart", label: "Coração", icon: HeartIcon },
  { value: "rocket", label: "Foguete", icon: RocketIcon },
  { value: "lightning", label: "Raio", icon: LightningBoltIcon },
  { value: "globe", label: "Globo", icon: GlobeIcon },
  { value: "chat", label: "Conversa", icon: ChatBubbleIcon },
  { value: "calendar", label: "Calendário", icon: CalendarIcon },
  { value: "target", label: "Alvo", icon: TargetIcon },
  { value: "archive", label: "Arquivo", icon: ArchiveIcon },
  { value: "backpack", label: "Mochila", icon: BackpackIcon },
  { value: "home", label: "Casa", icon: HomeIcon },
  { value: "person", label: "Pessoa", icon: PersonIcon },
  { value: "code", label: "Código", icon: CodeIcon },
  { value: "magic", label: "Varinha", icon: MagicWandIcon }
];

export const analyticsRangeOptions: { value: AnalyticsRange; label: string; days: number | null }[] = [
  { value: "24h", label: "24h", days: 1 },
  { value: "7d", label: "7 dias", days: 7 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "90d", label: "90 dias", days: 90 },
  { value: "all", label: "Tudo", days: null }
];

export const linkEventLabels: Record<LinkEventType, string> = {
  created: "criou o link",
  updated: "editou o link",
  deleted: "excluiu o link",
  expired: "encerrou o link no fim do período",
  exhausted: "encerrou o link ao atingir o limite de acessos",
  group_detached: "removeu o link do grupo ao excluir o grupo"
};

export const linkChangeLabels: Record<LinkChangeField, string> = {
  title: "Título",
  slug: "Slug",
  url: "Destino",
  groupId: "Grupo",
  mode: "Ativação",
  startsAt: "Início",
  endsAt: "Fim",
  maxClicks: "Limite de acessos"
};

export const historyFilterOptions: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "people", label: "Pessoas" },
  { value: "system", label: "Sistema" }
];

export const deviceLabels: Record<string, string> = {
  desktop: "Computador",
  mobile: "Celular",
  tablet: "Tablet"
};

export const weekdayShortLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
