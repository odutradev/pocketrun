import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import useAction from "@hooks/useAction";

import type { JsonPayload, UseJsonConfigOptions, UseJsonConfigReturn } from "./types";

const logger = createLocalLogger("useJsonConfig");

const format = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const isJsonPayload = (value: unknown): value is JsonPayload => typeof value === "object" && value !== null && !Array.isArray(value);

const parsePayload = (text: string): JsonPayload | null => {
  try {
    const parsed: unknown = JSON.parse(text);
    return isJsonPayload(parsed) ? parsed : null;
  } catch (error) {
    logger.warn(error);
    return null;
  }
};

const useJsonConfig = <TResult>({ isEnabled, exportConfig, applyConfig, toConfig, onApplied }: UseJsonConfigOptions<TResult>): UseJsonConfigReturn => {
  const [loaded, setLoaded] = useState<string | null>(null);
  const [text, setText] = useState("");
  const exportRef = useRef(exportConfig);

  useEffect(() => {
    exportRef.current = exportConfig;
  }, [exportConfig]);

  const show = useCallback((value: unknown) => {
    setLoaded(format(value));
    setText(format(value));
  }, []);

  const reload = useCallback(
    () =>
      exportRef
        .current()
        .then(show)
        .catch((error: unknown) => {
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar a configuração"));
        }),
    [show]
  );

  useEffect(() => {
    if (isEnabled) reload();
  }, [isEnabled, reload]);

  const applying = useAction({
    action: applyConfig,
    toastMessages: { pending: "Aplicando a configuração…", success: "Configuração aplicada", error: "Não foi possível aplicar a configuração" },
    callback: (result) => {
      show(toConfig(result));
      onApplied?.(result);
    }
  });

  const apply = () => {
    const payload = parsePayload(text);
    if (!payload) {
      toast.error("O JSON está malformado. Confira vírgulas, aspas e chaves antes de aplicar.");
      return;
    }
    applying.execute(payload);
  };

  return {
    text,
    isLoaded: loaded !== null,
    isDirty: loaded !== null && text !== loaded,
    isApplying: applying.isPending,
    setText,
    reload,
    apply
  };
};

export default useJsonConfig;
