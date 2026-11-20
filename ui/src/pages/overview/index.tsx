import { useEffect } from "react";

import AttentionList from "./subcomponents/attentionList";
import { Container, Content, Row, Stats } from "./styles";
import ServiceCards from "./subcomponents/serviceCards";
import TrafficPanel from "./subcomponents/trafficPanel";
import ContentNavbar from "@components/contentNavbar";
import { pluralize } from "@utils/functions";
import StatCard from "@components/statCard";
import OverviewSkeleton from "./skeleton";
import useOverviewPage from "./hook";

const OverviewPage = () => {
  const { overview, kv, isLoading, load } = useOverviewPage();

  useEffect(() => {
    load();
  }, [load]);

  const renderContent = () => {
    if (!overview || !kv) return <OverviewSkeleton />;

    const visits = overview.pagesTraffic.totals.clicks + overview.linksTraffic.totals.clicks;

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
          <StatCard label="Acessos em 7 dias" value={visits.toLocaleString("pt-BR")} hint="Páginas e links, sem robôs" />
        </Stats>
        <ServiceCards />
        <Row>
          <TrafficPanel
            title="Páginas"
            traffic={overview.pagesTraffic}
            ranked={overview.pagesTraffic.topPages}
            basePath="/pages"
            emptyText="Nenhuma página acessada nos últimos 7 dias."
          />
          <TrafficPanel
            title="Links"
            traffic={overview.linksTraffic}
            ranked={overview.linksTraffic.topLinks}
            basePath="/links"
            emptyText="Nenhum link clicado nos últimos 7 dias."
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
        info="Um resumo de todo o ambiente: as aplicações do KV, as páginas, os links, os acessos dos últimos 7 dias e o que precisa de atenção."
        onReload={load}
        isReloading={isLoading}
      />
      {renderContent()}
    </Container>
  );
};

export default OverviewPage;
