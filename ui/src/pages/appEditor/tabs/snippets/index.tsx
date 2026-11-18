import { Column, Hint, Mono, Panel, PanelTitle } from "../../styles";
import CodeBlock from "@components/codeBlock";
import CopyField from "@components/copyField";
import useAppEditorPage from "../../hook";
import { Fields, List } from "./styles";
import { apiUrl } from "@assets/config";

const snippets = [
  {
    key: "curl",
    title: "cURL · gravar",
    code: `curl -X POST "${apiUrl}/kv/pedidos/create" \\
  -H "Authorization: Bearer <SEU_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"data": {"cliente": "Maria", "valor": 150.00, "status": "pago"}}'`
  },
  {
    key: "js",
    title: "JavaScript · gravar",
    code: `const response = await fetch("${apiUrl}/kv/pedidos/create", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <SEU_TOKEN>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    data: { cliente: "Maria", valor: 150.0, status: "pago" }
  })
});
const document = await response.json();`
  },
  {
    key: "list",
    title: "JavaScript · listar com filtro",
    code: `const response = await fetch("${apiUrl}/kv/pedidos/get-all?status=pago&page=1&limit=20", {
  headers: { "Authorization": "Bearer <SEU_TOKEN>" }
});
const { data, total, totalPages } = await response.json();`
  },
  {
    key: "update",
    title: "JavaScript · atualizar",
    code: `await fetch(\`${apiUrl}/kv/pedidos/update/\${id}\`, {
  method: "PATCH",
  headers: {
    "Authorization": "Bearer <SEU_TOKEN>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ data: { status: "entregue" } })
});`
  }
];

const SnippetsTab = () => {
  const { application } = useAppEditorPage();

  return (
    <Column>
      <Panel aria-labelledby="connection-title">
        <PanelTitle id="connection-title">Conexão</PanelTitle>
        <Fields>
          <CopyField value={apiUrl} label="URL da API" />
          <CopyField value={application?.projectId ?? ""} label="Project ID" />
        </Fields>
      </Panel>
      <Panel aria-labelledby="snippets-title">
        <PanelTitle id="snippets-title">Exemplos</PanelTitle>
        <Hint>
          Troque <Mono>&lt;SEU_TOKEN&gt;</Mono> por um token de acesso desta aplicação e <Mono>pedidos</Mono> pelo nome da sua coleção. A
          coleção é criada no primeiro documento gravado.
        </Hint>
        <List>
          {snippets.map((snippet) => (
            <CodeBlock key={snippet.key} title={snippet.title} code={snippet.code} isCopyable />
          ))}
        </List>
      </Panel>
    </Column>
  );
};

export default SnippetsTab;
