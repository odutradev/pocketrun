import { Change, Empty, Info, Item, ItemTitle, List, Rank, Slug, Total, TotalLabel, Totals, TotalValue, Value } from "./styles";
import { Panel, PanelHeader, PanelHint, PanelTitle } from "../../styles";
import { formatPercentChange, pluralize } from "@utils/functions";
import ClicksChart from "@components/clicksChart";
import LinkButton from "@components/linkButton";

import type { TrafficPanelProps } from "./types";

const topCount = 5;

const TrafficPanel = ({ title, traffic, ranked, basePath, emptyText }: TrafficPanelProps) => {
  const { totals } = traffic;
  const top = ranked.slice(0, topCount);

  return (
    <Panel aria-label={title}>
      <PanelHeader>
        <PanelTitle>{title}</PanelTitle>
        <PanelHint>Últimos 7 dias</PanelHint>
      </PanelHeader>
      <Totals>
        <Total>
          <TotalLabel>acessos</TotalLabel>
          <TotalValue>{totals.clicks.toLocaleString("pt-BR")}</TotalValue>
          <Change>{formatPercentChange(totals.clicks, totals.previousClicks) ?? "Sem comparação"}</Change>
        </Total>
        <Total>
          <TotalLabel>visitantes únicos</TotalLabel>
          <TotalValue>{totals.visitors.toLocaleString("pt-BR")}</TotalValue>
          <Change>{formatPercentChange(totals.visitors, totals.previousVisitors) ?? "Contados uma vez por dia"}</Change>
        </Total>
      </Totals>
      {totals.clicks > 0 && <ClicksChart series={traffic.series} bucket={traffic.bucket} markers={[]} />}
      {top.length === 0 ? (
        <Empty>{emptyText}</Empty>
      ) : (
        <List aria-label={`Mais acessados em ${title}`}>
          {top.map((item, index) => (
            <li key={item.id}>
              <Item to={`${basePath}/${item.id}/edit?tab=analytics`} aria-label={`${item.title}, ${pluralize(item.clicks, "acesso", "acessos")}`}>
                <Rank aria-hidden="true">{index + 1}</Rank>
                <Info>
                  <ItemTitle>{item.title}</ItemTitle>
                  <Slug>/{item.slug}</Slug>
                </Info>
                <Value aria-hidden="true">{item.clicks.toLocaleString("pt-BR")}</Value>
              </Item>
            </li>
          ))}
        </List>
      )}
      <LinkButton to={`${basePath}/analytics`} variant="secondary" size="sm">
        Ver a análise completa
      </LinkButton>
    </Panel>
  );
};

export default TrafficPanel;
