import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useKvDocsPage from "../../hook";

const DocumentsSection = () => {
  const { apiUrl } = useKvDocsPage();

  return (
    <DocSection id="documents" number="06" title="Ler, atualizar e apagar">
      <Bullets>
        <li>
          <Code>GET /kv/{"{colecao}"}/get/{"{id}"}</Code> devolve o documento, ou 404 com <Code>document_not_found</Code>.
        </li>
        <li>
          <Code>PATCH /kv/{"{colecao}"}/update/{"{id}"}</Code> troca o <Code>data</Code> inteiro: campos que você não mandar somem. Para mudar
          um campo só, leia o documento, junte a mudança e mande tudo. A validade não muda.
        </li>
        <li>
          <Code>DELETE /kv/{"{colecao}"}/delete/{"{id}"}</Code> apaga um documento. <Code>delete-all</Code> na coleção ou em{" "}
          <Code>project</Code> apaga em massa e responde com <Code>deletedCount</Code>. Nada disso tem volta.
        </li>
      </Bullets>
      <Paragraph>Atualizar e apagar um documento respondem com uma mensagem curta, não com o documento.</Paragraph>
      <CodeGrid>
        <CodeBlock
          title="Mudar um campo"
          isCopyable
          code={`const headers = {
  "Authorization": "Bearer <SEU_TOKEN>",
  "Content-Type": "application/json"
};
const base = "${apiUrl}/kv/pedidos";

const atual = await fetch(\`\${base}/get/\${id}\`, { headers }).then((r) => r.json());

await fetch(\`\${base}/update/\${id}\`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ data: { ...atual.data, status: "entregue" } })
});`}
        />
        <CodeBlock
          title="Respostas"
          language="json"
          code={`{ "message": "Document updated successfully" }

{ "message": "Document deleted successfully" }

{ "message": "Collection cleared successfully", "deletedCount": 12 }`}
        />
      </CodeGrid>
    </DocSection>
  );
};

export default DocumentsSection;
