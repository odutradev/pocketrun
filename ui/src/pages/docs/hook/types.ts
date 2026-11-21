import type { DocTocGroup, NumberedDocSection } from "@utils/types/docs";

export interface UseDocsPageReturn {
  groups: DocTocGroup[];
  sections: NumberedDocSection[];
  apiUrl: string;
  linksUrl: string;
  llmsText: string;
  handleJump: (sectionId: string) => void;
  handleDownloadLlms: () => void;
}
