import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";

import { publicLinkUrl, pluralize } from "@utils/functions";
import { setPageStatus } from "@actions/sitePages";
import useAction from "@hooks/useAction";
import useMediaQuery from "@hooks/useMediaQuery";
import useClipboard from "@hooks/useClipboard";
import DataTable from "@components/dataTable";
import { getPageColumns } from "../../table";
import usePagesPage from "../../hook";
import PageCards from "../pageCards";

import type { PageCollectionProps } from "./types";
import type { SitePage } from "@utils/types/sitePage";

const PageCollection = ({ sitePages, total, caption }: PageCollectionProps) => {
  const navigate = useNavigate();
  const { breakpoints } = useTheme();
  const isMobile = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const { copy, isCopied } = useClipboard();
  const { view, handleOpenRemove, loadPages } = usePagesPage();

  const { execute: toggleStatus } = useAction({
    action: (target: SitePage) => setPageStatus(target.id, target.state === "inactive"),
    toastMessages: {
      pending: "Mudando o estado da página…",
      success: "Estado da página atualizado",
      error: "Não foi possível mudar o estado da página"
    },
    callback: () => {
      loadPages();
    }
  });

  const pageOptions = {
    isCopied,
    onCopy: (sitePage: SitePage) => copy(publicLinkUrl(sitePage.slug), sitePage.id),
    onEdit: (sitePage: SitePage) => navigate(`/pages/${sitePage.id}/edit`),
    onRemove: handleOpenRemove,
    onToggle: (target: SitePage) => {
      toggleStatus(target);
    }
  };

  if (isMobile) return <PageCards sitePages={sitePages} isCompact {...pageOptions} />;
  if (view === "cards") return <PageCards sitePages={sitePages} isCompact={false} {...pageOptions} />;

  return (
    <DataTable
      caption={`${caption}, ${pluralize(total, "item", "itens")}`}
      columns={getPageColumns(pageOptions)}
      rows={sitePages}
      getRowKey={(sitePage) => sitePage.id}
      minWidth="720px"
    />
  );
};

export default PageCollection;
