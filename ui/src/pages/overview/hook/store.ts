import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { getPageSummary, getPagesOverview } from "@actions/sitePages";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getLinkSummary, getLinksOverview } from "@actions/links";
import { getEnvironmentUsage } from "@actions/overview";
import { listApplications } from "@actions/apps";

import type { OverviewStore } from "./types";

const logger = createLocalLogger("overviewPage");

const useOverviewStore = create<OverviewStore>()(
  persist(
    (set, get) => ({
      range: "7d",
      overview: null,
      isLoading: false,
      requestId: 0,
      load: async () => {
        const { range, requestId: previousRequestId } = get();
        const requestId = previousRequestId + 1;
        set({ isLoading: true, requestId });
        try {
          const [applications, pageSummary, linkSummary, pagesTraffic, linksTraffic, usage] = await Promise.all([
            listApplications(),
            getPageSummary(),
            getLinkSummary(),
            getPagesOverview(range),
            getLinksOverview(range),
            getEnvironmentUsage(range)
          ]);
          if (get().requestId !== requestId) return;
          set({ overview: { applications, pageSummary, linkSummary, pagesTraffic, linksTraffic, usage } });
        } catch (error) {
          if (get().requestId !== requestId) return;
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar a visão geral"));
        } finally {
          if (get().requestId === requestId) set({ isLoading: false });
        }
      },
      setRange: (range) => set({ range })
    }),
    { name: "overview-page", partialize: (state) => ({ range: state.range }) }
  )
);

export default useOverviewStore;
