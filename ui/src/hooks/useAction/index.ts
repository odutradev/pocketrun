import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { createLocalLogger, getErrorMessage } from "@utils/functions";

import type { UseActionOptions, UseActionReturn } from "./types";

const logger = createLocalLogger("useAction");

const useAction = <TArgs extends unknown[], TResult>({
  action,
  toastMessages,
  callback
}: UseActionOptions<TArgs, TResult>): UseActionReturn<TArgs, TResult> => {
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsPending(true);
      const toastId = toast.loading(toastMessages.pending);
      try {
        const result = await action(...args);
        toast.update(toastId, { render: toastMessages.success, type: "success", isLoading: false, autoClose: 3000 });
        callback?.(result);
        return result;
      } catch (error) {
        logger.error(error);
        const message = getErrorMessage(error, toastMessages.error);
        toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });
        return undefined;
      } finally {
        setIsPending(false);
      }
    },
    [action, toastMessages, callback]
  );

  return { execute, isPending };
};

export default useAction;
