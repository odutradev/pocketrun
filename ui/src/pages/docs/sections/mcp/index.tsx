import { PersonIcon } from "@radix-ui/react-icons";

import { Actions, Bullets, Code, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import { apiKeyScopeOptions } from "@assets/data";
import LinkButton from "@components/linkButton";
import CopyField from "@components/copyField";
import McpSetup from "@components/mcpSetup";
import { mcpUrl } from "@assets/config";
import Alert from "@components/alert";

const placeholderKey = "prk_cole_sua_chave_aqui";

const McpSection = () => (
  <DocSection id="mcp">
    <Paragraph>
      O PocketRun tem um servidor MCP: uma IA como o Claude conecta nele e gerencia páginas, links, grupos, aplicações do KV, cargos, tokens e
      PINs conversando. As ferramentas fazem o mesmo que o painel, com as mesmas regras, e cada mudança fica no histórico em seu nome.
    </Paragraph>
    <CopyField value={mcpUrl} label="Endereço do servidor MCP" />
    <Bullets>
      <li>
        No <strong>Perfil</strong>, em <strong>Chaves de API para IA</strong>, gere uma chave. A tela seguinte já mostra a configuração com a
        chave dentro, pronta para copiar.
      </li>
      <li>
        A chave vai no header <Code>Authorization: Bearer prk_…</Code>. Ela aparece uma vez só; o painel guarda apenas um hash e mostra o
        prefixo.
      </li>
      <li>Revogar a chave no Perfil corta o acesso da IA na hora.</li>
      <li>
        A ferramenta <Code>docs</Code> entrega à IA este guia completo, com os endereços da sua instância. Ela é lida antes de montar páginas com
        dados, cargos e PINs.
      </li>
    </Bullets>
    <Bullets>
      {apiKeyScopeOptions.map((option) => (
        <li key={option.value}>
          <strong>{option.label}:</strong> {option.description}
        </li>
      ))}
    </Bullets>
    <Paragraph>
      Configuração para o Claude. Troque <Code>{placeholderKey}</Code> pela sua chave, ou copie direto do Perfil, que já vem preenchida:
    </Paragraph>
    <McpSetup apiKey={placeholderKey} />
    <Alert tone="warning" title="A chave age como você">
      Quem tem a chave faz o que a permissão dela deixa, sem senha. Não cole a chave em repositórios públicos: no Claude Code, prefira o comando
      do terminal ou um <Code>.mcp.json</Code> fora do controle de versão. Para a IA só consultar, use <strong>Só leitura</strong>.
    </Alert>
    <Actions>
      <LinkButton to="/profile" variant="secondary" leftIcon={<PersonIcon />}>
        Gerar chave no Perfil
      </LinkButton>
    </Actions>
  </DocSection>
);

export default McpSection;
