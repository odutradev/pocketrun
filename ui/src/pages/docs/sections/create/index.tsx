import { Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useDocsPage from "../../hook";

const CreateSection = () => {
  const { apiUrl } = useDocsPage();

  return (
    <DocSection id="create">
      <Paragraph>
        Mande o objeto em <Code>data</Code>. A validade é opcional: <Code>expiresInDays</Code> (de 0 a 3650; 0 ou ausente é sem validade)
        ou <Code>expiresAt</Code> com a data exata. A resposta, com status 201, é o documento criado, já com o <Code>id</Code>. O corpo aceita
        até 1 MB. O nome da coleção usa letras, números, <Code>_</Code> e <Code>-</Code>, até 64 caracteres, e não pode ser{" "}
        <Code>project</Code>.
      </Paragraph>
      <CodeGrid>
        <CodeBlock
          title="JavaScript"
          isCopyable
          code={`const response = await fetch("${apiUrl}/kv/pedidos/create", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <SEU_TOKEN>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    data: { cliente: "Maria", valor: 150, status: "pago" },
    expiresInDays: 30
  })
});
const pedido = await response.json();`}
        />
        <CodeBlock
          title="Resposta 201"
          language="json"
          code={`{
  "id": "6afe329a1fde5580a00218f4",
  "appId": "6afe329a1fde5580a00218f1",
  "projectId": "financas-pessoais",
  "collectionName": "pedidos",
  "data": { "cliente": "Maria", "valor": 150, "status": "pago" },
  "expiresAt": "2026-12-18T20:19:43Z",
  "createdAt": "2026-11-18T20:19:43Z",
  "updatedAt": "2026-11-18T20:19:43Z"
}`}
        />
      </CodeGrid>
    </DocSection>
  );
};

export default CreateSection;
