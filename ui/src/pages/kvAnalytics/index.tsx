import { DownloadIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import KvAnalyticsReport from "@components/kvAnalyticsReport";
import SegmentedControl from "@components/segmentedControl";
import { Container, Content, Toolbar } from "./styles";
import { analyticsRangeOptions } from "@assets/data";
import ContentNavbar from "@components/contentNavbar";
import KvAnalyticsSkeleton from "./skeleton";
import useKvAnalyticsPage from "./hook";
import Button from "@components/button";

const KvAnalyticsPage = () => {
  const { range, overview, isLoading, load, handleRangeChange, handleExport } = useKvAnalyticsPage();

  useEffect(() => {
    load();
  }, [range, load]);

  return (
    <Container>
      <ContentNavbar
        title="Análise"
        parents={[{ label: "KV", to: "/kv" }]}
        info="Os pedidos à API pública do KV de todas as suas aplicações, contados por hora e guardados por 400 dias. Os pedidos das páginas pela ponte ficam na aba Acesso e dados de cada página; abra uma aplicação da lista para ver a análise só dela."
        onReload={load}
        isReloading={isLoading}
      />
      <Toolbar>
        <SegmentedControl label="Período da análise" options={analyticsRangeOptions} value={range} onValueChange={handleRangeChange} isFullWidth />
        <Button variant="secondary" size="sm" leftIcon={<DownloadIcon />} disabled={!overview || overview.series.length === 0} onClick={handleExport}>
          Exportar CSV
        </Button>
      </Toolbar>
      {overview ? (
        <Content aria-busy={isLoading}>
          <KvAnalyticsReport
            analytics={overview}
            topApplications={overview.topApplications}
            emptyDescription="Quando um cliente chamar a API do KV com o token de uma das suas aplicações, os gráficos de horário, operação e coleção aparecem aqui."
            averageHint={overview.range === "all" ? "Nos últimos 400 dias" : "No período escolhido"}
          />
        </Content>
      ) : (
        <KvAnalyticsSkeleton />
      )}
    </Container>
  );
};

export default KvAnalyticsPage;
