import { kvUsageOperationLabels, requestSeriesLabels, requestUnit } from "@assets/data";
import { Content, Duo, Note, Panel, PanelTitle, Row, Stats } from "./styles";
import { formatPercentChange, formatShortDateTime, pluralize } from "@utils/functions";
import TopApplications from "./subcomponents/topApplications";
import ActivityHeatmap from "@components/activityHeatmap";
import ClicksChart from "@components/clicksChart";
import EmptyState from "@components/emptyState";
import ShareList from "@components/shareList";
import StatCard from "@components/statCard";

import type { KvAnalyticsReportProps, ShareConverter } from "./types";

const dayMs = 86400000;

const toShares: ShareConverter = (items) => items.map((item) => ({ name: item.name, clicks: item.requests }));

const KvAnalyticsReport = ({ analytics, topApplications, emptyDescription, averageHint }: KvAnalyticsReportProps) => {
  const { totals } = analytics;
  const days = Math.max(1, (new Date(analytics.to).getTime() - new Date(analytics.from).getTime()) / dayMs);
  const perDay = totals.requests / days;
  const failedShare = totals.requests === 0 ? 0 : (totals.failed / totals.requests) * 100;
  const undetailed = totals.requests - analytics.operations.reduce((sum, share) => sum + share.requests, 0);

  const breakdown = (
    <Panel>
      <PanelTitle>O que pedem</PanelTitle>
      <Duo>
        <ShareList title="Operações" items={toShares(analytics.operations)} labels={kvUsageOperationLabels} unit={requestUnit} />
        <ShareList title="Coleções" items={toShares(analytics.collections)} unit={requestUnit} />
      </Duo>
    </Panel>
  );

  return (
    <Content>
      <Stats>
        <StatCard label="Pedidos" value={totals.requests.toLocaleString("pt-BR")} hint={formatPercentChange(totals.requests, totals.previousRequests, "Sem pedidos no período anterior")} />
        <StatCard
          label="Com erro"
          value={totals.failed.toLocaleString("pt-BR")}
          hint={totals.requests === 0 ? "Nenhum pedido no período" : `${failedShare.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% dos pedidos`}
        />
        <StatCard label="Média por dia" value={perDay.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} hint={averageHint} />
        <StatCard
          label="Última atividade"
          isTextValue
          value={analytics.lastActiveAt ? formatShortDateTime(analytics.lastActiveAt) : "—"}
          hint={analytics.lastActiveAt ? "Hora do último pedido" : "Nenhum pedido no período"}
        />
      </Stats>
      {totals.requests === 0 ? (
        <EmptyState isCompact title="Nenhum pedido no período" description={emptyDescription} />
      ) : (
        <>
          <Panel>
            <PanelTitle>Pedidos ao longo do tempo</PanelTitle>
            <ClicksChart
              series={analytics.series.map((point) => ({ at: point.at, clicks: point.requests, visitors: point.failed }))}
              bucket={analytics.bucket}
              markers={[]}
              labels={requestSeriesLabels}
            />
          </Panel>
          {topApplications ? (
            <Row>
              <Panel>
                <PanelTitle>Aplicações mais usadas</PanelTitle>
                <TopApplications applications={topApplications} />
              </Panel>
              {breakdown}
            </Row>
          ) : (
            breakdown
          )}
          <Panel>
            <PanelTitle>Quando usam</PanelTitle>
            <ActivityHeatmap cells={analytics.heatmap.map((cell) => ({ weekday: cell.weekday, hour: cell.hour, clicks: cell.requests }))} unit={requestUnit} />
          </Panel>
        </>
      )}
      {undetailed > 0 && (
        <Note>
          {pluralize(undetailed, "pedido antigo entra", "pedidos antigos entram")} no total sem operação nem coleção: esse detalhe passou a ser guardado
          nesta versão.
        </Note>
      )}
    </Content>
  );
};

export default KvAnalyticsReport;
