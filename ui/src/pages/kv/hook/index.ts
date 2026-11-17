import useKvStore from "./store";

import type { UseKvPageReturn } from "./types";

const useKvPage = (): UseKvPageReturn => {
  const { applications, isLoading, loadApplications } = useKvStore();

  return { applications, isLoading, loadApplications };
};

export default useKvPage;
