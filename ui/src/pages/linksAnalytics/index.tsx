import { DownloadIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import { currentTimestamp, downloadCsv, formatPercentChange, formatRelativeTime, formatShortDateTime, pluralize } from "@utils/functions";
import { BotNote, Container, Content, Panel, PanelTitle, Row, Stats, Toolbar, Trio } from "./styles";
import SegmentedControl from "@components/segmentedControl";
import ActivityHeatmap from "@components/activityHeatmap";
import ContentNavbar from "@components/contentNavbar";
import { analyticsRangeOptions } from "@assets/data";
import DevicesChart from "@components/devicesChart";
import ClicksChart from "@components/clicksChart";
import TopLinks from "./subcomponents/topLinks";
import EmptyState from "@components/emptyState";
import LinksAnalyticsSkeleton from "./skeleton";
import ShareList from "@components/shareList";
import StatCard from "@components/statCard";
import useLinksAnalyticsPage from "./hook";
import Button from "@components/button";

import type { LinksOverview } from "@utils/types/link";

const dayMs = 86400000;

const daysIn = (overview: LinksOverview) =>
  Math.max(1, (new Date(overview.to).getTime() - new Date(overview.from).getTime()) / dayMs);

const LinksAnalyticsPage = () => {
  const { range, overview, isLoading, load, handleRangeChange } = useLinksAnalyticsPage();

  useEffect(() => {
    load();
  }, [range, load]);

  const renderContent = () => {
    if (!overview) return <LinksAnalyticsSkeleton />;

    const now = currentTimestamp();
    const { totals } = overview;
    const perDay = totals.clicks / daysIn(overview);

    return (
      <Content aria-busy={isLoading}>
        <Stats>
          <StatCard label="Cliques" value={totals.clicks.toLocaleString("pt-BR")} hint={formatPercentChange(totals.clicks, totals.previousClicks)} />
          <StatCard
            label="Visitantes únicos"
            value={totals.visitors.toLocaleString("pt-BR")}
            hint={formatPercentChange(totals.visitors, totals.previousVisitors) ?? "Contados uma vez por dia"}
          />
          <StatCard
            label="Média por dia"
            value={perDay.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
            hint={overview.range === "all" ? "Nos últimos 12 meses" : "No período escolhido"}
          />
          <StatCard
            label="Último clique"
            isTextValue
            value={overview.lastClickAt ? formatRelativeTime(overview.lastClickAt, now) : "—"}
            hint={overview.lastClickAt ? formatShortDateTime(overview.lastClickAt) : "Nenhum clique no período"}
          />
        </Stats>
        {totals.clicks === 0 ? (
          <EmptyState
            isCompact
            title="Nenhum clique no período"
            description="Quando alguém abrir um dos seus links, os gráficos de horário, origem e dispositivo aparecem aqui."
          />
        ) : (
          <>
            <Panel>
              <PanelTitle>Cliques ao longo do tempo</PanelTitle>
              <ClicksChart series={overview.series} bucket={overview.bucket} markers={[]} />
            </Panel>
            <Row>
              <Panel>
                <PanelTitle>Links mais acessados</PanelTitle>
                <TopLinks />
              </Panel>
              <Panel>
                <PanelTitle>De onde vêm</PanelTitle>
                <ShareList title="Origens" items={overview.referrers} />
              </Panel>
            </Row>
            <Panel>
              <PanelTitle>Quando acessam</PanelTitle>
              <ActivityHeatmap cells={overview.heatmap} />
            </Panel>
            <Panel>
              <PanelTitle>Como acessam</PanelTitle>
              <Trio>
                <DevicesChart devices={overview.devices} />
                <ShareList title="Sistemas" items={overview.systems} />
                <ShareList title="Navegadores" items={overview.browsers} />
              </Trio>
            </Panel>
          </>
        )}
        {totals.bots > 0 && (
          <BotNote>
            {pluralize(totals.bots, "acesso de robô ou prévia de link ficou", "acessos de robôs ou prévias de link ficaram")} fora
            dos números.
          </BotNote>
        )}
      </Content>
    );
  };

  return (
    <Container>
      <ContentNavbar
        title="Análise"
        parents={[{ label: "Links", to: "/links" }]}
        info="Os acessos de todos os links juntos, sem robôs nem prévias de link. As aberturas ficam guardadas por 12 meses; abra um link da lista para ver a análise só dele."
        onReload={load}
        isReloading={isLoading}
      />
      <Toolbar>
        <SegmentedControl label="Período da análise" options={analyticsRangeOptions} value={range} onValueChange={handleRangeChange} isFullWidth />
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<DownloadIcon />}
          disabled={!overview || overview.series.length === 0}
          onClick={() =>
            overview &&
            downloadCsv(`links-${overview.range}.csv`, [
              ["Início do intervalo", "Cliques", "Visitantes únicos"],
              ...overview.series.map((point) => [new Date(point.at).toLocaleString("pt-BR"), point.clicks, point.visitors])
            ])
          }
        >
          Exportar CSV
        </Button>
      </Toolbar>
      {renderContent()}
    </Container>
  );
};

export default LinksAnalyticsPage;
