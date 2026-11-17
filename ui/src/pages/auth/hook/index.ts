import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

import type { UseAuthPageReturn } from "./types";

const useAuthPage = (): UseAuthPageReturn => {
  const navigate = useNavigate();
  const handleSuccess = useCallback(() => navigate("/"), [navigate]);

  return { handleSuccess };
};

export default useAuthPage;
