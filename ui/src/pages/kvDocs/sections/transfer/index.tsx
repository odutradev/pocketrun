import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useKvDocsPage from "../../hook";

const TransferSection = () => {
  const { apiUrl } = useKvDocsPage();

  return (
    <DocSection id="transfer" number="08" title="Importar e exportar">
      <Bullets>
        <li>
          <Code>GET /kv/{"{colecao}"}/export</Code> baixa a coleção. Com <Code>?format=csv</Code>, cada campo do data vira uma coluna, e objetos
          vão como JSON na célula. Textos que começam com <Code>=</Code>, <Code>+</Code>, <Code>-</Code> ou <Code>@</Code> ganham um apóstrofo
          para a planilha não executar fórmulas.
        </li>
        <li>
          <Code>POST /kv/{"{colecao}"}/import</Code> recebe <Code>{"{ \"data\": [ … ] }"}</Code> com até 5.000 itens e 8 MB. Cada item pode ser
          o objeto puro ou um documento exportado, com <Code>data</Code>, <Code>createdAt</Code> e a validade, que são mantidos.
        </li>
        <li>
          <Code>GET /kv/project/export</Code> e <Code>POST /kv/project/import</Code> fazem o mesmo com todas as coleções, agrupadas pelo nome.
          Só o cargo admin usa as rotas do projeto.
        </li>
        <li>Importar não junta com o que já existe: cada item vira um documento novo, com id novo.</li>
      </Bullets>
      <Paragraph>O limite de documentos do cargo também vale para a importação.</Paragraph>
      <CodeGrid>
        <CodeBlock
          title="Copiar uma coleção"
          isCopyable
          code={`const headers = { "Authorization": "Bearer <SEU_TOKEN>" };

const exportados = await fetch("${apiUrl}/kv/pedidos/export", { headers }).then((r) => r.json());

await fetch("${apiUrl}/kv/pedidos-2025/import", {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ data: exportados })
});`}
        />
        <CodeBlock
          title="Resposta da importação"
          language="json"
          code={`{ "imported": true, "count": 42 }

{
  "imported": true,
  "totalCount": 57,
  "collections": { "pedidos": 42, "clientes": 15 }
}`}
        />
      </CodeGrid>
    </DocSection>
  );
};

export default TransferSection;
