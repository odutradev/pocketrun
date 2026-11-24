import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";

import { publicLinkUrl, pluralize } from "@utils/functions";
import { setLinkStatus } from "@actions/links";
import useAction from "@hooks/useAction";
import useMediaQuery from "@hooks/useMediaQuery";
import useClipboard from "@hooks/useClipboard";
import DataTable from "@components/dataTable";
import { getLinkColumns } from "../../table";
import useLinksPage from "../../hook";
import LinkCards from "../linkCards";

import type { LinkCollectionProps } from "./types";
import type { Link } from "@utils/types/link";

const LinkCollection = ({ links, total, caption }: LinkCollectionProps) => {
  const navigate = useNavigate();
  const { breakpoints } = useTheme();
  const isMobile = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const { copy, isCopied } = useClipboard();
  const { view, handleOpenRemove, loadLinks } = useLinksPage();

  const { execute: toggleStatus } = useAction({
    action: (target: Link) => setLinkStatus(target.id, target.state === "inactive"),
    toastMessages: {
      pending: "Mudando o estado do link…",
      success: "Estado do link atualizado",
      error: "Não foi possível mudar o estado do link"
    },
    callback: () => {
      loadLinks();
    }
  });

  const linkOptions = {
    isCopied,
    onCopy: (link: Link) => copy(publicLinkUrl(link.slug), link.id),
    onEdit: (link: Link) => navigate(`/links/${link.id}/edit`),
    onRemove: handleOpenRemove,
    onToggle: (target: Link) => {
      toggleStatus(target);
    }
  };

  if (isMobile) return <LinkCards links={links} isCompact {...linkOptions} />;
  if (view === "cards") return <LinkCards links={links} isCompact={false} {...linkOptions} />;

  return (
    <DataTable
      caption={`${caption}, ${pluralize(total, "item", "itens")}`}
      columns={getLinkColumns(linkOptions)}
      rows={links}
      getRowKey={(link) => link.id}
      minWidth="720px"
    />
  );
};

export default LinkCollection;
