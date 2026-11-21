import { CheckIcon, CopyIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

import { Clicks, ClicksLimit, Host, LinkCell, Meta, RowActions, Slug, StateCell, StateDetail, Title } from "./styles";
import { countedOpens, describeLinkRule, publicLinkUrl, urlHost } from "@utils/functions";
import IconButton from "@components/iconButton";
import { linkStateLabels } from "@assets/data";
import Badge from "@components/badge";

import type { DataTableColumn } from "@components/dataTable/types";
import type { LinkColumnsOptions } from "./types";
import type { Link } from "@utils/types/link";

export const getLinkColumns = ({ isCopied, onCopy, onEdit, onRemove }: LinkColumnsOptions): DataTableColumn<Link>[] => [
  {
    key: "link",
    header: "Link",
    render: (link) => (
      <LinkCell>
        <Title>{link.title}</Title>
        <Meta>
          <Slug
            href={publicLinkUrl(link.slug)}
            target="_blank"
            rel="noopener noreferrer"
            title={publicLinkUrl(link.slug)}
            aria-label={`Abrir /${link.slug} em nova aba`}
          >
            /{link.slug}
          </Slug>
          <Host title={link.url}>{urlHost(link.url)}</Host>
        </Meta>
      </LinkCell>
    )
  },
  {
    key: "state",
    header: "Estado",
    render: (link) => {
      const rule = describeLinkRule(link);
      return (
        <StateCell>
          <Badge tone={linkStateLabels[link.state].tone} hasDot>
            {linkStateLabels[link.state].label}
          </Badge>
          {rule && <StateDetail>{rule}</StateDetail>}
        </StateCell>
      );
    }
  },
  {
    key: "clicks",
    header: "Acessos",
    align: "right",
    render: (link) => (
      <Clicks>
        {(link.mode === "clicks" && link.maxClicks !== null ? countedOpens(link) : link.clicks).toLocaleString("pt-BR")}
        {link.mode === "clicks" && link.maxClicks !== null && (
          <ClicksLimit> / {link.maxClicks.toLocaleString("pt-BR")}</ClicksLimit>
        )}
      </Clicks>
    )
  },
  {
    key: "actions",
    header: "Ações",
    isHeaderHidden: true,
    align: "right",
    render: (link) => (
      <RowActions>
        <IconButton
          label={isCopied(link.id) ? "URL copiada" : `Copiar a URL de ${link.title}`}
          icon={isCopied(link.id) ? <CheckIcon /> : <CopyIcon />}
          size="sm"
          onClick={() => onCopy(link)}
        />
        <IconButton label={`Editar ${link.title}`} icon={<Pencil1Icon />} size="sm" onClick={() => onEdit(link)} />
        <IconButton
          label={`Excluir ${link.title}`}
          icon={<TrashIcon />}
          size="sm"
          variant="danger"
          onClick={() => onRemove(link)}
        />
      </RowActions>
    )
  }
];
