import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import Alert from "@components/alert";

const PageDataSection = () => (
  <DocSection id="page-data">
    <Paragraph>
      Uma página do serviço de Páginas pode usar o KV sem token. Na aba <strong>Acesso e dados</strong> do editor, clique em{" "}
      <strong>Ativar dados</strong>: a página ganha uma aplicação do KV só dela, com os cargos <Code>leitura</Code>, <Code>escrita</Code> e{" "}
      <Code>gestao</Code> para todas as coleções. Quem abre sem PIN fica com leitura e os PINs com escrita, e dá para trocar cada um. A página
      recebe <Code>pocketrun.kv</Code> pronto.
    </Paragraph>
    <Bullets>
      <li>
        Os cargos e as regras de cada coleção são editados na própria aba, ao lado dos PINs. A aplicação da página também aparece na lista do
        KV com a marca <strong>Da página</strong>, onde você vê os documentos. Ela não tem token nem origens até você criar.
      </li>
      <li>Desativar os dados mantém os documentos e os cargos, que voltam ao ativar de novo. Excluir a página apaga a aplicação junto.</li>
    </Bullets>
    <Bullets>
      <li>
        As chamadas vão para o próprio endereço da página, em <Code>/{"{slug}"}/_/kv/…</Code>. O servidor descobre o cargo pelo PIN usado, num
        cookie que o JavaScript não lê.
      </li>
      <li>
        Pela página dá para listar, ler, contar, calcular, criar, editar, trocar e apagar documentos. Limpar coleções, importar e exportar
        ficam de fora.
      </li>
      <li>
        Trocar um PIN, encerrar os acessos, mudar o cargo ou desligar o KV vale no próximo pedido: quem estava com a página aberta recebe{" "}
        <Code>401 page_locked</Code> ou <Code>403</Code>.
      </li>
      <li>
        Cada visitante faz até 120 pedidos por minuto, e a página toda até 1.200; depois disso vem <Code>429 too_many_requests</Code>.
      </li>
      <li>
        <Code>pocketrun.kv.can(colecao, operacao)</Code> diz o que o cargo permite, para esconder botões. Quem decide é sempre o servidor.
      </li>
      <li>
        Na prévia do editor, as chamadas passam pelo painel, com o cargo escolhido em <strong>Ver como</strong>. Os pedidos da página e da
        prévia aparecem na aba Acesso e dados.
      </li>
    </Bullets>
    <Alert tone="warning" title="Todas as páginas dividem o mesmo domínio">
      O HTML de uma página consegue chamar o endereço de outra. Se uma pessoa abriu as duas com PIN, o cookie da outra vai junto. Use cargos
      pequenos por página e não ligue dados sensíveis a páginas públicas.
    </Alert>
    <CodeGrid>
      <CodeBlock
        title="JavaScript da página"
        isCopyable
        code={`const pedidos = pocketrun.kv.collection("pedidos");

const { data } = await pedidos.list({ status: "pago", page: 1, limit: 20 });
const novo = await pedidos.create({ cliente: "Maria", valor: 150 });
await pedidos.update(novo.id, { status: "entregue" });
const total = await pedidos.eval("sum", "valor", { status: "pago" });

if (pocketrun.kv.can("pedidos", "delete")) mostrarBotaoApagar();`}
      />
      <CodeBlock
        title="O que a página recebe"
        language="json"
        code={`{
  "access": { "isProtected": true, "role": "gerente" },
  "kv": {
    "role": "caixa",
    "isOwnDocumentsOnly": false,
    "rules": [{ "collection": "pedidos", "operations": ["read", "create", "update"] }]
  }
}`}
      />
    </CodeGrid>
    <Paragraph>
      Os erros são objetos <Code>Error</Code> com <Code>code</Code>, <Code>status</Code> e <Code>fields</Code>. Textos passados nos filtros
      vão sempre como texto: <Code>{"list({ codigo: \"010\" })"}</Code> procura o texto "010".
    </Paragraph>
  </DocSection>
);

export default PageDataSection;
