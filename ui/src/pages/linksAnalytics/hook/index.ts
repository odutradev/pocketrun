import useLinksAnalyticsStore from "./store";

import type { UseLinksAnalyticsPageReturn } from "./types";

const useLinksAnalyticsPage = (): UseLinksAnalyticsPageReturn => {
  const { range, overview, isLoading, load, setRange } = useLinksAnalyticsStore();

  return {
    range,
    overview,
    isLoading,
    load,
    handleRangeChange: setRange
  };
};

export default useLinksAnalyticsPage;
