import { apiUrl, linksUrl } from "@assets/config";
import useMediaQuery from "@hooks/useMediaQuery";
import { kvDocSections } from "@assets/data";

import type { UseKvDocsPageReturn } from "./types";

const useKvDocsPage = (): UseKvDocsPageReturn => {
  const shouldReduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return {
    sections: kvDocSections,
    apiUrl,
    linksUrl,
    handleJump: (sectionId) =>
      document.getElementById(sectionId)?.scrollIntoView({ block: "start", behavior: shouldReduceMotion ? "auto" : "smooth" })
  };
};

export default useKvDocsPage;
