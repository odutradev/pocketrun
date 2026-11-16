import { useCallback, useEffect, useRef, useState } from "react";

import { copyFeedbackDuration } from "@assets/config";
import { createLocalLogger } from "@utils/functions";

import type { UseClipboardReturn } from "./types";

const defaultKey = "default";
const logger = createLocalLogger("useClipboard");

const useClipboard = (): UseClipboardReturn => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = useCallback(async (text: string, key = defaultKey) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopiedKey(null), copyFeedbackDuration);
    } catch (error) {
      logger.error(error);
    }
  }, []);

  const isCopied = useCallback((key = defaultKey) => copiedKey === key, [copiedKey]);

  return { copy, isCopied };
};

export default useClipboard;
