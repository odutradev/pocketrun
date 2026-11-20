import { listAttentionItems, summarizeKv } from "@utils/functions";
import useOverviewStore from "./store";

import type { UseOverviewPageReturn } from "./types";

const useOverviewPage = (): UseOverviewPageReturn => {
  const { overview, isLoading, load } = useOverviewStore();

  return {
    overview,
    kv: overview ? summarizeKv(overview.applications) : null,
    attention: overview ? listAttentionItems(overview.applications) : [],
    isLoading,
    load
  };
};

export default useOverviewPage;
