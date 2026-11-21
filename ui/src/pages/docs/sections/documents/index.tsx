import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useDocsPage from "../../hook";

const DocumentsSection = () => {
  const { apiUrl } = useDocsPage();

  return (
    <DocSection id="documents">
      <Bullets>
        <li>
          <Code>GET /kv/{"{colecao}"}/get/{"{id}"}</Code> devolve o documento, ou 404 com <Code>document_not_found</Code>.
        </li>
        <li>
          <Code>PATCH /kv/{"{colecao}"}/update/{"{id}"}</Code> junta os campos enviados ao <Code>data</Code>: só eles mudam, o resto fica.
          Mandar um campo com <Code>null</Code> grava nulo.
        </li>
        <li>
          <Code>PUT /kv/{"{colecao}"}/replace/{"{id}"}</Code> troca o <Code>data</Code> inteiro: campos que você não mandar somem.
        </li>
        <li>
          <Code>DELETE /kv/{"{colecao}"}/delete/{"{id}"}</Code> apaga um documento. <Code>delete-all</Code> na coleção ou em{" "}
          <Code>project</Code> apaga em massa e responde com <Code>deletedCount</Code>. Nada disso tem volta.
        </li>
      </Bullets>
      <Paragraph>Atualizar e trocar respondem com o documento já atualizado. Apagar responde com uma mensagem curta.</Paragraph>
      <CodeGrid>
        <CodeBlock
          title="Mudar um campo"
          isCopyable
          code={`const response = await fetch(\`${apiUrl}/kv/pedidos/update/\${id}\`, {
  method: "PATCH",
  headers: {
    "Authorization": "Bearer <SEU_TOKEN>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ data: { status: "entregue" } })
});
const pedido = await response.json();`}
        />
        <CodeBlock
          title="Respostas"
          language="json"
          code={`{ "id": "6afe…18f4", "data": { "cliente": "Maria", "status": "entregue" } }

{ "message": "Document deleted successfully" }

{ "message": "Collection cleared successfully", "deletedCount": 12 }`}
        />
      </CodeGrid>
    </DocSection>
  );
};

export default DocumentsSection;
