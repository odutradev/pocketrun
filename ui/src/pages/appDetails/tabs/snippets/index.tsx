import SectionHeader from "@components/sectionHeader";
import { Body, List, Placeholder } from "./styles";
import CodeBlock from "@components/codeBlock";
import { apiUrl } from "@assets/config";
import Card from "@components/card";

const snippets = [
  {
    key: "curl",
    title: "cURL",
    code: `curl -X POST "${apiUrl}/kv/pedidos/create" \\
  -H "Authorization: Bearer <SEU_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"data": {"cliente": "Maria", "valor": 150.00, "status": "pago"}}'`
  },
  {
    key: "js",
    title: "JavaScript (fetch)",
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
  }
];

const SnippetsTab = () => (
  <Card as="section" aria-labelledby="snippets-title">
    <Body>
      <SectionHeader
        titleId="snippets-title"
        title="Snippets"
        description={
          <>
            Exemplos prontos para gravar um documento. Troque <Placeholder>&lt;SEU_TOKEN&gt;</Placeholder> por um token de
            acesso desta aplicação.
          </>
        }
      />
      <List>
        {snippets.map((snippet) => (
          <CodeBlock key={snippet.key} title={snippet.title} code={snippet.code} isCopyable />
        ))}
      </List>
    </Body>
  </Card>
);

export default SnippetsTab;
