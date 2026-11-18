import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getLinksOverview } from "@actions/links";

import type { LinksAnalyticsStore } from "./types";

const logger = createLocalLogger("linksAnalyticsPage");

const useLinksAnalyticsStore = create<LinksAnalyticsStore>()(
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
          const overview = await getLinksOverview(range);
          if (get().requestId !== requestId) return;
          set({ overview });
        } catch (error) {
          if (get().requestId !== requestId) return;
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar a análise dos links"));
        } finally {
          if (get().requestId === requestId) set({ isLoading: false });
        }
      },
      setRange: (range) => set({ range })
    }),
    { name: "links-analytics-page", partialize: (state) => ({ range: state.range }) }
  )
);

export default useLinksAnalyticsStore;
