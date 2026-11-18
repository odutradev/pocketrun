import type { StoredPageDraft } from "@utils/types/sitePage";

export interface PageDraftsStore {
  drafts: Record<string, StoredPageDraft>;
  saveDraft: (pageId: string, draft: StoredPageDraft) => void;
  clearDraft: (pageId: string) => void;
}
