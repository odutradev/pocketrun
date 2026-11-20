import { toast } from "react-toastify";
import { create } from "zustand";

import { getPageSummary, getPagesOverview } from "@actions/sitePages";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getLinkSummary, getLinksOverview } from "@actions/links";
import { listApplications } from "@actions/apps";

import type { OverviewStore } from "./types";

const logger = createLocalLogger("overviewPage");

const trafficRange = "7d";

const useOverviewStore = create<OverviewStore>()((set, get) => ({
  overview: null,
  isLoading: false,
  requestId: 0,
  load: async () => {
    const requestId = get().requestId + 1;
    set({ isLoading: true, requestId });
    try {
      const [applications, pageSummary, linkSummary, pagesTraffic, linksTraffic] = await Promise.all([
        listApplications(),
        getPageSummary(),
        getLinkSummary(),
        getPagesOverview(trafficRange),
        getLinksOverview(trafficRange)
      ]);
      if (get().requestId !== requestId) return;
      set({ overview: { applications, pageSummary, linkSummary, pagesTraffic, linksTraffic } });
    } catch (error) {
      if (get().requestId !== requestId) return;
      logger.error(error);
      toast.error(getErrorMessage(error, "Não foi possível carregar a visão geral"));
    } finally {
      if (get().requestId === requestId) set({ isLoading: false });
    }
  }
}));

export default useOverviewStore;
