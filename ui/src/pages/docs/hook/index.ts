import { docGroups, docSections, docsLlmsFileName, docsLlmsText } from "@assets/data/docs";
import { downloadBlob } from "@utils/functions/brandAssets";
import { apiUrl, linksUrl } from "@assets/config";
import useMediaQuery from "@hooks/useMediaQuery";

import type { NumberedDocSection } from "@utils/types/docs";
import type { UseDocsPageReturn } from "./types";

const sections: NumberedDocSection[] = docSections.map((section, index) => ({ ...section, number: String(index + 1).padStart(2, "0") }));

const groups = docGroups.map((group) => ({ ...group, sections: sections.filter((section) => section.group === group.id) }));

const useDocsPage = (): UseDocsPageReturn => {
  const shouldReduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return {
    groups,
    sections,
    apiUrl,
    linksUrl,
    llmsText: docsLlmsText,
    handleJump: (sectionId) =>
      document.getElementById(sectionId)?.scrollIntoView({ block: "start", behavior: shouldReduceMotion ? "auto" : "smooth" }),
    handleDownloadLlms: () => downloadBlob(new Blob([docsLlmsText], { type: "text/plain;charset=utf-8" }), docsLlmsFileName)
  };
};

export default useDocsPage;
