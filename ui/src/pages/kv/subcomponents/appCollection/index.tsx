import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";

import useMediaQuery from "@hooks/useMediaQuery";
import useClipboard from "@hooks/useClipboard";
import DataTable from "@components/dataTable";
import { pluralize } from "@utils/functions";
import { getAppColumns } from "../../table";
import useKvPage from "../../hook";
import AppCards from "../appCards";

import type { Application } from "@utils/types/application";
import type { AppCollectionProps } from "./types";

const AppCollection = ({ applications, total, caption }: AppCollectionProps) => {
  const navigate = useNavigate();
  const { breakpoints } = useTheme();
  const isMobile = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const { copy, isCopied } = useClipboard();
  const { view, handleOpenRemove } = useKvPage();

  const appOptions = {
    isCopied,
    onCopy: (application: Application) => copy(application.projectId, application.id),
    onEdit: (application: Application) => navigate(`/kv/${application.id}/edit`),
    onRemove: handleOpenRemove
  };

  if (isMobile) return <AppCards applications={applications} isCompact {...appOptions} />;
  if (view === "cards") return <AppCards applications={applications} isCompact={false} {...appOptions} />;

  return (
    <DataTable
      caption={`${caption}, ${pluralize(total, "item", "itens")}`}
      columns={getAppColumns(appOptions)}
      rows={applications}
      getRowKey={(application) => application.id}
      minWidth="720px"
    />
  );
};

export default AppCollection;
