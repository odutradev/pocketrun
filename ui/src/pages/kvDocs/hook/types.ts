import type { KvDocSection } from "@utils/types/kvDocs";

export interface UseKvDocsPageReturn {
  sections: KvDocSection[];
  apiUrl: string;
  linksUrl: string;
  handleJump: (sectionId: string) => void;
}
