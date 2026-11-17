import { CheckIcon, CopyIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

import { Destination, Muted, RowActions, Slug, StateCell, StateDetail, Title, TitleCell } from "./styles";
import { formatDateTime, pluralize } from "@utils/functions";
import IconButton from "@components/iconButton";
import { linkStateLabels } from "@assets/data";
import Badge from "@components/badge";

import type { DataTableColumn } from "@components/dataTable/types";
import type { LinkColumnsOptions } from "./types";
import type { Link } from "@utils/types/link";

const describeRule = (link: Link) => {
  if (link.mode === "clicks" && link.maxClicks !== null) return `${link.clicks} de ${link.maxClicks} acessos`;
  if (link.mode !== "period") return null;
  if (link.state === "scheduled" && link.startsAt) return `Começa em ${formatDateTime(link.startsAt)}`;
  return link.endsAt ? `Até ${formatDateTime(link.endsAt)}` : null;
};

export const getLinkColumns = ({
  groupNames,
  isCopied,
  onCopy,
  onEdit,
  onRemove
}: LinkColumnsOptions): DataTableColumn<Link>[] => [
  {
    key: "title",
    header: "Link",
    render: (link) => (
      <TitleCell>
        <Title>{link.title}</Title>
        <Slug>/{link.slug}</Slug>
      </TitleCell>
    )
  },
  { key: "url", header: "Destino", render: (link) => <Destination title={link.url}>{link.url}</Destination> },
  {
    key: "group",
    header: "Grupo",
    render: (link) => (link.groupId && groupNames[link.groupId] ? groupNames[link.groupId] : <Muted>Sem grupo</Muted>)
  },
  {
    key: "state",
    header: "Estado",
    render: (link) => {
      const rule = describeRule(link);
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
  { key: "clicks", header: "Acessos", align: "right", render: (link) => pluralize(link.clicks, "acesso", "acessos") },
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
