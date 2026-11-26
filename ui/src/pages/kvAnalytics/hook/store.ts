import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getKvOverview } from "@actions/apps";

import type { KvAnalyticsStore } from "./types";

const logger = createLocalLogger("kvAnalyticsPage");

const useKvAnalyticsStore = create<KvAnalyticsStore>()(
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
          const overview = await getKvOverview(range);
          if (get().requestId !== requestId) return;
          set({ overview });
        } catch (error) {
          if (get().requestId !== requestId) return;
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar a análise do KV"));
        } finally {
          if (get().requestId === requestId) set({ isLoading: false });
        }
      },
      setRange: (range) => set({ range })
    }),
    { name: "kv-analytics-page", partialize: (state) => ({ range: state.range }) }
  )
);

export default useKvAnalyticsStore;
