import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import useAuthPageStore from "./store";
import type { UseAuthPageReturn } from "./types";

const useAuthPage = (): UseAuthPageReturn => {
  const navigate = useNavigate();
  const { mode, setMode } = useAuthPageStore();
  const handleSuccess = useCallback(() => navigate("/"), [navigate]);

  return { mode, handleModeChange: setMode, handleSuccess };
};

export default useAuthPage;
