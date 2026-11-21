import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useDocsPage from "../../hook";

const ListSection = () => {
  const { apiUrl } = useDocsPage();

  return (
    <DocSection id="list">
      <Paragraph>
        O <Code>get-all</Code> devolve os documentos do mais novo ao mais antigo, a não ser que você peça outra ordem. Sem paginação, a
        resposta é um array com todos eles; com paginação, é um objeto com a página.
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
          <strong>Tipos</strong>: <Code>true</Code> e <Code>false</Code> viram booleanos, números viram números, <Code>null</Code> vira nulo e
          o resto é texto. Entre aspas, o valor é sempre texto: <Code>?codigo="010"</Code> procura o texto "010", e <Code>?codigo=010</Code>{" "}
          procura o número 10.
        </li>
        <li>
          <strong>Operadores</strong>: depois do campo, <Code>__gt</Code>, <Code>__gte</Code>, <Code>__lt</Code>, <Code>__lte</Code> e{" "}
          <Code>__ne</Code> comparam; <Code>__contains</Code> busca um trecho do texto sem diferenciar maiúsculas (até 100 caracteres, sem
          expressão regular); <Code>__exists=true</Code> pede que o campo exista. Exemplo: <Code>?valor__gte=100&valor__lt=500</Code>.
        </li>
        <li>
          <strong>Datas</strong>: <Code>createdAfter</Code> e <Code>createdBefore</Code> recortam pela criação, em <Code>2026-11-01</Code> ou
          data e hora ISO 8601.
        </li>
        <li>
          <strong>Ordem</strong>: <Code>sortBy</Code> aceita <Code>createdAt</Code>, <Code>updatedAt</Code>, <Code>expiresAt</Code> ou um campo
          do data, como <Code>valor</Code>; <Code>sortOrder</Code> é <Code>asc</Code> ou <Code>desc</Code> (padrão).
        </li>
        <li>Vários filtros juntos valem ao mesmo tempo (E).</li>
      </Bullets>
      <CodeGrid>
        <CodeBlock
          title="JavaScript"
          isCopyable
          code={`const url = new URL("${apiUrl}/kv/pedidos/get-all");
url.searchParams.set("status", "pago");
url.searchParams.set("cliente__contains", "mar");
url.searchParams.set("sortBy", "valor");
url.searchParams.set("sortOrder", "asc");
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
