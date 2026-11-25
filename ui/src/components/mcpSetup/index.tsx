import { useState } from "react";

import { buildClaudeCodeMcpCommand, buildClaudeCodeMcpConfig, buildClaudeDesktopMcpConfig } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import { Code, Container, Hint } from "./styles";
import { mcpClientOptions } from "@assets/data";
import CodeBlock from "@components/codeBlock";

import type { McpClient } from "@utils/types/apiKey";
import type { McpSetupProps } from "./types";

const McpSetup = ({ apiKey }: McpSetupProps) => {
  const [client, setClient] = useState<McpClient>("claudeCode");

  return (
    <Container>
      <SegmentedControl label="Cliente de IA" options={mcpClientOptions} value={client} onValueChange={setClient} size="sm" />
      {client === "claudeCode" ? (
        <>
          <Hint>
            Salve como <Code>.mcp.json</Code> na raiz do projeto, ou junte ao <Code>mcpServers</Code> que já existe.
          </Hint>
          <CodeBlock title=".mcp.json" code={buildClaudeCodeMcpConfig(apiKey)} language="json" isCopyable />
          <Hint>Ou rode no terminal:</Hint>
          <CodeBlock title="Terminal" code={buildClaudeCodeMcpCommand(apiKey)} language="text" isCopyable />
        </>
      ) : (
        <>
          <Hint>
            Em Configurações, Desenvolvedor, Editar configuração, junte ao <Code>claude_desktop_config.json</Code> e reinicie o app. Precisa do
            Node.js instalado: o <Code>mcp-remote</Code> faz a ponte com o servidor.
          </Hint>
          <CodeBlock title="claude_desktop_config.json" code={buildClaudeDesktopMcpConfig(apiKey)} language="json" isCopyable />
        </>
      )}
    </Container>
  );
};

export default McpSetup;
