import { useEffect } from "react";

import { Column, Container, Hint, Mono, Panel, PanelHeader, PanelTitle, Rules, Stats } from "./styles";
import { currentTimestamp } from "@utils/functions";
import KvLinkForm from "./subcomponents/kvLinkForm";
import EmptyState from "@components/emptyState";
import DataTable from "@components/dataTable";
import CodeBlock from "@components/codeBlock";
import usePageEditorPage from "../../hook";
import { requestColumns } from "./table";
import Button from "@components/button";
import Badge from "@components/badge";

const usageExample = `const tarefas = pocketrun.kv.collection("tarefas");

const { data, totalPages } = await tarefas.list({ feita: false, page: 1, limit: 20 });
const nova = await tarefas.create({ titulo: "Comprar pão", feita: false });
await tarefas.update(nova.id, { feita: true });
await tarefas.remove(nova.id);

const abertas = await tarefas.count({ feita: false });
const soma = await pocketrun.kv.collection("pedidos").eval("sum", "valor");

if (!pocketrun.kv.can("tarefas", "delete")) esconderBotaoApagar();

try {
  await tarefas.create({ titulo: "" });
} catch (error) {
  console.warn(error.code, error.status, error.fields);
}`;

const DataTab = () => {
  const { kv, kvRequests, isKvRequestsLoading, loadKvRequests } = usePageEditorPage();
  const isLinked = Boolean(kv?.binding);
  const now = currentTimestamp();

  useEffect(() => {
    if (isLinked) loadKvRequests();
  }, [isLinked, loadKvRequests]);

  return (
    <Container>
      <Column>
        <KvLinkForm />
        {isLinked && (
          <Panel aria-labelledby="kv-requests-title">
            <PanelHeader>
              <PanelTitle id="kv-requests-title">Pedidos recentes</PanelTitle>
              <Button variant="secondary" size="sm" onClick={loadKvRequests} isLoading={isKvRequestsLoading} loadingLabel="Atualizando…">
                Atualizar
              </Button>
            </PanelHeader>
            <Stats>
              <Badge>{`${kvRequests?.total ?? 0} pedidos em 24 h`}</Badge>
              <Badge tone={(kvRequests?.denied ?? 0) > 0 ? "warning" : "neutral"}>{`${kvRequests?.denied ?? 0} recusados`}</Badge>
            </Stats>
            {kvRequests && kvRequests.requests.length > 0 ? (
              <DataTable
                caption="Últimos pedidos da página ao KV"
                columns={requestColumns(now)}
                rows={kvRequests.requests}
                getRowKey={(request) => request.id}
                minWidth="560px"
              />
            ) : (
              <EmptyState
                isCompact
                title="Nenhum pedido ainda"
                description="Os pedidos da página e da prévia ao KV aparecem aqui, com o cargo usado e o resultado. Ficam guardados por 30 dias."
              />
            )}
          </Panel>
        )}
      </Column>
      <Column>
        <Panel>
          <PanelTitle>Como usar no HTML</PanelTitle>
          <Hint>
            A página ligada recebe <Mono>pocketrun.kv</Mono> pronto. Sem token, sem URL da API: a página fala com o próprio endereço dela, e o servidor
            decide o que cada cargo pode fazer.
          </Hint>
          <CodeBlock title="JavaScript da página" code={usageExample} isCopyable />
        </Panel>
        <Panel>
          <PanelTitle>Por que é seguro</PanelTitle>
          <Rules>
            <li>Nenhum token vai para o HTML. Quem abre a página não tem como chamar a API do KV direto.</li>
            <li>O cargo vem do PIN usado para abrir a página, guardado num cookie que o JavaScript não lê. O HTML não consegue trocar de cargo.</li>
            <li>Só o próprio endereço da página é aceito: outros sites não conseguem usar a sessão de quem abriu a página.</li>
            <li>Trocar um PIN, encerrar os acessos, mudar os cargos ou desligar o KV vale no próximo pedido.</li>
            <li>Cada visitante faz até 120 pedidos por minuto, e a página toda até 1.200.</li>
            <li>Limpar coleções, importar e exportar ficam de fora: pela página só dá para ler, criar, editar e apagar documentos.</li>
          </Rules>
        </Panel>
      </Column>
    </Container>
  );
};

export default DataTab;
