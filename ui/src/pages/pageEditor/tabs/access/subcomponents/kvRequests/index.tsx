import { useEffect } from "react";

import { Panel, PanelHeader, PanelTitle, Stats } from "../../styles";
import { currentTimestamp } from "@utils/functions";
import usePageEditorPage from "../../../../hook";
import EmptyState from "@components/emptyState";
import DataTable from "@components/dataTable";
import { requestColumns } from "./table";
import Button from "@components/button";
import Badge from "@components/badge";

const KvRequests = () => {
  const { kv, kvRequests, isKvRequestsLoading, loadKvRequests } = usePageEditorPage();
  const isLinked = Boolean(kv?.binding);

  useEffect(() => {
    if (isLinked) loadKvRequests();
  }, [isLinked, loadKvRequests]);

  if (!isLinked) return null;

  return (
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
          columns={requestColumns(currentTimestamp())}
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
  );
};

export default KvRequests;
