import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useKvDocsPage from "../../hook";

const ListSection = () => {
  const { apiUrl } = useKvDocsPage();

  return (
    <DocSection id="list" number="05" title="Listar e filtrar">
      <Paragraph>
        O <Code>get-all</Code> devolve os documentos do mais novo ao mais antigo. Sem paginação, a resposta é um array com todos eles; com
        paginação, é um objeto com a página.
      </Paragraph>
      <Bullets>
        <li>
          <strong>Paginação</strong>: <Code>page</Code> (a partir de 1) e <Code>limit</Code> (padrão 50, máximo 500). Mandar qualquer um
          deles, ou <Code>pagination=true</Code>, liga a paginação. Valores fora da faixa voltam ao padrão.
        </li>
        <li>
          <strong>Filtros</strong>: qualquer outro parâmetro filtra por igualdade sobre o <Code>data</Code>. <Code>?status=pago</Code> busca{" "}
          <Code>data.status</Code> igual a "pago", e campos aninhados usam ponto: <Code>?cliente.cidade=Recife</Code>.
        </li>
        <li>
          <strong>Tipos</strong>: <Code>true</Code> e <Code>false</Code> viram booleanos, números viram números e o resto é texto. Por isso{" "}
          <Code>?codigo=010</Code> procura o número 10, não o texto "010".
        </li>
        <li>Vários filtros juntos valem ao mesmo tempo (E). Não há busca parcial, maior que ou menor que.</li>
      </Bullets>
      <CodeGrid>
        <CodeBlock
          title="JavaScript"
          isCopyable
          code={`const url = new URL("${apiUrl}/kv/pedidos/get-all");
url.searchParams.set("status", "pago");
url.searchParams.set("page", "1");
url.searchParams.set("limit", "20");

const response = await fetch(url, {
  headers: { "Authorization": "Bearer <SEU_TOKEN>" }
});
const { data, total, totalPages } = await response.json();`}
        />
        <CodeBlock
          title="Resposta paginada"
          language="json"
          code={`{
  "data": [{ "id": "6afe…18f4", "data": { "status": "pago" } }],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}`}
        />
      </CodeGrid>
    </DocSection>
  );
};

export default ListSection;
