import { Change, Empty, Info, Item, ItemTitle, List, Rank, Slug, Total, TotalLabel, Totals, TotalValue, Value } from "../trafficPanel/styles";
import { Panel, PanelHeader, PanelHint, PanelTitle } from "../../styles";
import { formatPercentChange, pluralize } from "@utils/functions";
import { requestSeriesLabels } from "@assets/data";
import ClicksChart from "@components/clicksChart";
import LinkButton from "@components/linkButton";

import type { KvPanelProps } from "./types";

const topCount = 5;

const KvPanel = ({ traffic, rangeLabel, emptyText }: KvPanelProps) => {
  const { totals } = traffic;
  const top = traffic.topApplications.slice(0, topCount);
  const failedShare = totals.requests === 0 ? 0 : (totals.failed / totals.requests) * 100;

  return (
    <Panel aria-label="KV">
      <PanelHeader>
        <PanelTitle>KV</PanelTitle>
        <PanelHint>{rangeLabel}</PanelHint>
      </PanelHeader>
      <Totals>
        <Total>
          <TotalLabel>pedidos</TotalLabel>
          <TotalValue>{totals.requests.toLocaleString("pt-BR")}</TotalValue>
          <Change>{formatPercentChange(totals.requests, totals.previousRequests, "Sem pedidos no período anterior") ?? "Sem comparação"}</Change>
        </Total>
        <Total>
          <TotalLabel>com erro</TotalLabel>
          <TotalValue>{totals.failed.toLocaleString("pt-BR")}</TotalValue>
          <Change>{totals.requests === 0 ? "Nenhum pedido" : `${failedShare.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% dos pedidos`}</Change>
        </Total>
      </Totals>
      {totals.requests > 0 && (
        <ClicksChart
          series={traffic.series.map((point) => ({ at: point.at, clicks: point.requests, visitors: point.failed }))}
          bucket={traffic.bucket}
          markers={[]}
          labels={requestSeriesLabels}
        />
      )}
      {top.length === 0 ? (
        <Empty>{emptyText}</Empty>
      ) : (
        <List aria-label="Aplicações mais usadas no KV">
          {top.map((application, index) => (
            <li key={application.id}>
              <Item
                to={`/kv/${application.id}/edit?tab=analytics`}
                aria-label={`${application.name}, ${pluralize(application.requests, "pedido", "pedidos")}`}
              >
                <Rank aria-hidden="true">{index + 1}</Rank>
                <Info>
                  <ItemTitle>{application.name}</ItemTitle>
                  <Slug>{application.projectId}</Slug>
                </Info>
                <Value aria-hidden="true">{application.requests.toLocaleString("pt-BR")}</Value>
              </Item>
            </li>
          ))}
        </List>
      )}
      <LinkButton to="/kv/analytics" variant="secondary" size="sm">
        Ver a análise completa
      </LinkButton>
    </Panel>
  );
};

export default KvPanel;
