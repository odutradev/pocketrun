import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useDocsPage from "../../hook";

const AuthSection = () => {
  const { apiUrl } = useDocsPage();

  return (
    <DocSection id="auth">
      <Paragraph>
        Toda rota do KV pede um token de acesso da aplicação, gerado na aba Tokens. O token começa com <Code>pk_live_</Code> e pode ir em
        qualquer um destes headers:
      </Paragraph>
      <Bullets>
        <li>
          <Code>Authorization: Bearer pk_live_…</Code>, o recomendado.
        </li>
        <li>
          <Code>X-Pocket-Token: pk_live_…</Code>
        </li>
        <li>
          <Code>controlAccess: pk_live_…</Code>, mantido para clientes antigos do PocketDB.
        </li>
      </Bullets>
      <Paragraph>
        Depois do token, a API confere a origem. Chamadas de navegador só passam se o site estiver na lista de origens da aplicação (ou se ela
        aceitar qualquer origem). Chamadas sem o header <Code>Origin</Code>, como as de scripts e servidores, só passam se a aplicação aceitar
        chamadas fora do navegador. Toda resposta autenticada traz o header <Code>projectID</Code>.
      </Paragraph>
      <CodeGrid>
        <CodeBlock
          title="Conferir o token"
          isCopyable
          code={`curl "${apiUrl}/validate/control-access" \\
  -H "Authorization: Bearer <SEU_TOKEN>"`}
        />
        <CodeBlock
          title="Resposta"
          language="json"
          code={`{
  "status": "valid",
  "message": "Access token and origin are valid",
  "projectId": "financas-pessoais",
  "appName": "Finanças pessoais"
}`}
        />
      </CodeGrid>
    </DocSection>
  );
};

export default AuthSection;
