import usePagesAnalyticsStore from "./store";

import type { UsePagesAnalyticsPageReturn } from "./types";

const usePagesAnalyticsPage = (): UsePagesAnalyticsPageReturn => {
  const { range, overview, isLoading, load, setRange } = usePagesAnalyticsStore();

  return {
    range,
    overview,
    isLoading,
    load,
    handleRangeChange: setRange
  };
};

export default usePagesAnalyticsPage;
