import { docGroups, docSections, docsLlmsPath } from "@assets/data/docs";
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
    llmsUrl: `${window.location.origin}${docsLlmsPath}`,
    handleJump: (sectionId) =>
      document.getElementById(sectionId)?.scrollIntoView({ block: "start", behavior: shouldReduceMotion ? "auto" : "smooth" })
  };
};

export default useDocsPage;
