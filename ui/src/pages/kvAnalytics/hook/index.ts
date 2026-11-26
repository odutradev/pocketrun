import { downloadKvUsageCsv } from "@utils/functions";
import useKvAnalyticsStore from "./store";

import type { UseKvAnalyticsPageReturn } from "./types";

const useKvAnalyticsPage = (): UseKvAnalyticsPageReturn => {
  const { range, overview, isLoading, load, setRange } = useKvAnalyticsStore();

  return {
    range,
    overview,
    isLoading,
    load,
    handleRangeChange: setRange,
    handleExport: () => overview && downloadKvUsageCsv(`kv-${overview.range}.csv`, overview)
  };
};

export default useKvAnalyticsPage;
