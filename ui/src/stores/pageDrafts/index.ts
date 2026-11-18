import { persist } from "zustand/middleware";
import { create } from "zustand";

import { storageKeys } from "@assets/config";

import type { PageDraftsStore } from "./types";

const usePageDraftsStore = create<PageDraftsStore>()(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (pageId, draft) => set((state) => ({ drafts: { ...state.drafts, [pageId]: draft } })),
      clearDraft: (pageId) =>
        set((state) => {
          if (!state.drafts[pageId]) return state;
          const { [pageId]: _removed, ...drafts } = state.drafts;
          return { drafts };
        })
    }),
    { name: storageKeys.pageDrafts }
  )
);

export default usePageDraftsStore;
