import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getPagesOverview } from "@actions/sitePages";

import type { PagesAnalyticsStore } from "./types";

const logger = createLocalLogger("pagesAnalyticsPage");

const usePagesAnalyticsStore = create<PagesAnalyticsStore>()(
  persist(
    (set, get) => ({
      range: "30d",
      overview: null,
      isLoading: false,
      requestId: 0,
      load: async () => {
        const { range, requestId: previousRequestId } = get();
        const requestId = previousRequestId + 1;
        set({ isLoading: true, requestId });
        try {
          const overview = await getPagesOverview(range);
          if (get().requestId !== requestId) return;
          set({ overview });
        } catch (error) {
          if (get().requestId !== requestId) return;
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar a análise das páginas"));
        } finally {
          if (get().requestId === requestId) set({ isLoading: false });
        }
      },
      setRange: (range) => set({ range })
    }),
    { name: "pages-analytics-page", partialize: (state) => ({ range: state.range }) }
  )
);

export default usePagesAnalyticsStore;
