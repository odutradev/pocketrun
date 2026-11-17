import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import type { UseAuthPageReturn } from "./types";

const useAuthPage = (): UseAuthPageReturn => {
  const navigate = useNavigate();
  const handleSuccess = useCallback(() => navigate("/"), [navigate]);

  return { handleSuccess };
};

export default useAuthPage;
