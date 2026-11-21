import { downloadCsv, listAttentionItems, summarizeKv } from "@utils/functions";
import { analyticsRangeOptions } from "@assets/data";
import useOverviewStore from "./store";

import type { UseOverviewPageReturn } from "./types";

const useOverviewPage = (): UseOverviewPageReturn => {
  const { range, overview, isLoading, load, setRange } = useOverviewStore();
  const rangeOption = analyticsRangeOptions.find((option) => option.value === range);

  const handleExport = () => {
    if (!overview) return;
    downloadCsv(`geral-${overview.usage.range}.csv`, [
      ["Início do intervalo", "Acessos às páginas", "Cliques nos links", "Pedidos ao KV"],
      ...overview.usage.series.map((point) => [new Date(point.at).toLocaleString("pt-BR"), point.pages, point.links, point.kv])
    ]);
  };

  return {
    range,
    rangeLabel: rangeOption?.days ? (rangeOption.days === 1 ? "Últimas 24 horas" : `Últimos ${rangeOption.days} dias`) : "Todo o período",
    overview,
    kv: overview ? summarizeKv(overview.applications) : null,
    attention: overview ? listAttentionItems(overview.applications) : [],
    isLoading,
    load,
    handleRangeChange: setRange,
    handleExport
  };
};

export default useOverviewPage;
