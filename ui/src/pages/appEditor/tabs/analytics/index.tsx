import { DownloadIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import KvAnalyticsReport from "@components/kvAnalyticsReport";
import SegmentedControl from "@components/segmentedControl";
import { Container, Stats, Toolbar } from "./styles";
import { analyticsRangeOptions } from "@assets/data";
import Skeleton from "@components/skeleton";
import useAppEditorPage from "../../hook";
import Button from "@components/button";
import Alert from "@components/alert";

const AnalyticsTab = () => {
  const {
    application,
    ownerPage,
    analytics,
    analyticsRange,
    isAnalyticsLoading,
    refreshKey,
    loadAnalytics,
    handleAnalyticsRangeChange,
    handleExportAnalytics
  } = useAppEditorPage();

  useEffect(() => {
    loadAnalytics();
  }, [analyticsRange, refreshKey, loadAnalytics]);

  const isPageApplication = Boolean(application?.pageId);

  return (
    <Container aria-busy={!analytics || isAnalyticsLoading}>
      <Toolbar>
        <SegmentedControl
          label="Período da análise"
          options={analyticsRangeOptions}
          value={analyticsRange}
          onValueChange={handleAnalyticsRangeChange}
          isFullWidth
        />
        <Button variant="secondary" size="sm" leftIcon={<DownloadIcon />} disabled={!analytics || analytics.series.length === 0} onClick={handleExportAnalytics}>
          Exportar CSV
        </Button>
      </Toolbar>
      {isPageApplication && (
        <Alert title="Os pedidos da página ficam na página">
          Esta análise conta só os pedidos à API pública do KV feitos com um token. Os pedidos que a página{ownerPage ? ` ${ownerPage.title}` : ""} faz
          pela ponte aparecem na aba Acesso e dados dela, com o cargo e o resultado de cada um.
        </Alert>
      )}
      {analytics ? (
        <KvAnalyticsReport
          analytics={analytics}
          emptyDescription="Quando um cliente chamar a API do KV com um token desta aplicação, os gráficos de horário, operação e coleção aparecem aqui."
          averageHint={analytics.range === "all" ? "Desde a criação da aplicação" : "No período escolhido"}
        />
      ) : (
        <>
          <Stats>
            <Skeleton height="112px" radius="panel" />
            <Skeleton height="112px" radius="panel" />
            <Skeleton height="112px" radius="panel" />
            <Skeleton height="112px" radius="panel" />
          </Stats>
          <Skeleton height="340px" radius="panel" />
        </>
      )}
    </Container>
  );
};

export default AnalyticsTab;
