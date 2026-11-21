import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useDocsPage from "../../hook";

const AggregateSection = () => {
  const { apiUrl } = useDocsPage();

  return (
    <DocSection id="aggregate">
      <Paragraph>
        Para números de painel, conte e calcule no servidor em vez de baixar a coleção inteira. As duas rotas aceitam os mesmos filtros do{" "}
        <Code>get-all</Code> na URL.
      </Paragraph>
      <Bullets>
        <li>
          <Code>GET /kv/{"{colecao}"}/count</Code> responde <Code>{"{ \"count\": 12 }"}</Code>.
        </li>
        <li>
          <Code>POST /kv/{"{colecao}"}/eval</Code> recebe <Code>operation</Code> (<Code>sum</Code>, <Code>avg</Code>, <Code>min</Code>,{" "}
          <Code>max</Code>, <Code>count</Code> ou <Code>distinct</Code>), o <Code>field</Code> do data e, se quiser, mais <Code>filters</Code>{" "}
          no corpo, com os mesmos operadores.
        </li>
        <li>
          Sem documentos, <Code>sum</Code> e <Code>count</Code> dão 0, e <Code>avg</Code>, <Code>min</Code> e <Code>max</Code> dão{" "}
          <Code>null</Code>. O <Code>distinct</Code> devolve até 1.000 valores, do mais frequente ao menos.
        </li>
      </Bullets>
      <CodeGrid>
        <CodeBlock
          title="JavaScript"
          isCopyable
          code={`const response = await fetch("${apiUrl}/kv/pedidos/eval?createdAfter=2026-11-01", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <SEU_TOKEN>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    operation: "sum",
    field: "valor",
    filters: { status: "pago" }
  })
});
const { result } = await response.json();`}
        />
        <CodeBlock
          title="Respostas"
          language="json"
          code={`{ "operation": "sum", "field": "valor", "result": 4180.5 }

{
  "operation": "distinct",
  "field": "status",
  "result": [
    { "value": "pago", "count": 31 },
    { "value": "pendente", "count": 11 }
  ]
}`}
        />
      </CodeGrid>
    </DocSection>
  );
};

export default AggregateSection;
