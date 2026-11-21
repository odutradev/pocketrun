import { DownloadIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import { Container, Content, Row, Stats, Toolbar } from "./styles";
import SegmentedControl from "@components/segmentedControl";
import AttentionList from "./subcomponents/attentionList";
import ServiceCards from "./subcomponents/serviceCards";
import TrafficPanel from "./subcomponents/trafficPanel";
import ContentNavbar from "@components/contentNavbar";
import { analyticsRangeOptions } from "@assets/data";
import UsageChart from "./subcomponents/usageChart";
import { pluralize } from "@utils/functions";
import StatCard from "@components/statCard";
import OverviewSkeleton from "./skeleton";
import Button from "@components/button";
import useOverviewPage from "./hook";

const OverviewPage = () => {
  const { range, rangeLabel, overview, kv, isLoading, load, handleRangeChange, handleExport } = useOverviewPage();

  useEffect(() => {
    load();
  }, [range, load]);

  const renderContent = () => {
    if (!overview || !kv) return <OverviewSkeleton />;

    const visits = overview.pagesTraffic.totals.clicks + overview.linksTraffic.totals.clicks;
    const periodText = rangeLabel.toLowerCase();

    return (
      <Content aria-busy={isLoading}>
        <Stats>
          <StatCard
            label="Aplicações do KV"
            value={kv.applications.toLocaleString("pt-BR")}
            hint={kv.pageApplications > 0 ? pluralize(kv.pageApplications, "criada por uma página", "criadas por páginas") : "Nenhuma de página"}
          />
          <StatCard
            label="Tokens ativos"
            value={kv.activeTokens.toLocaleString("pt-BR")}
            hint={kv.expiringTokens > 0 ? `${pluralize(kv.expiringTokens, "vence", "vencem")} em breve` : "Nenhum perto de vencer"}
          />
          <StatCard
            label="Páginas e links"
            value={(overview.pageSummary.total + overview.linkSummary.total).toLocaleString("pt-BR")}
            hint={`${pluralize(overview.pageSummary.total, "página", "páginas")} e ${pluralize(overview.linkSummary.total, "link", "links")}`}
          />
          <StatCard label="Acessos no período" value={visits.toLocaleString("pt-BR")} hint="Páginas e links, sem robôs" />
        </Stats>
        <UsageChart />
        <ServiceCards />
        <Row>
          <TrafficPanel
            title="Páginas"
            traffic={overview.pagesTraffic}
            ranked={overview.pagesTraffic.topPages}
            basePath="/pages"
            rangeLabel={rangeLabel}
            emptyText={`Nenhuma página acessada: ${periodText}.`}
          />
          <TrafficPanel
            title="Links"
            traffic={overview.linksTraffic}
            ranked={overview.linksTraffic.topLinks}
            basePath="/links"
            rangeLabel={rangeLabel}
            emptyText={`Nenhum link clicado: ${periodText}.`}
          />
        </Row>
        <AttentionList />
      </Content>
    );
  };

  return (
    <Container>
      <ContentNavbar
        title="Geral"
        info="Um resumo de todo o ambiente: as aplicações do KV, as páginas, os links, o uso de cada serviço no período escolhido e o que precisa de atenção."
        onReload={load}
        isReloading={isLoading}
      />
      <Toolbar>
        <SegmentedControl label="Período da visão geral" options={analyticsRangeOptions} value={range} onValueChange={handleRangeChange} isFullWidth />
        <Button variant="secondary" size="sm" leftIcon={<DownloadIcon />} disabled={!overview || overview.usage.series.length === 0} onClick={handleExport}>
          Exportar CSV
        </Button>
      </Toolbar>
      {renderContent()}
    </Container>
  );
};

export default OverviewPage;
