import { CheckIcon, CopyIcon, PauseIcon, Pencil1Icon, PlayIcon, TrashIcon } from "@radix-ui/react-icons";

import { Clicks, ClicksLimit, Host, LinkCell, Meta, RowActions, Slug, StateCell, StateDetail, Title } from "./styles";
import { describeLinkRule, formatBytes, publicLinkUrl, versionLabel } from "@utils/functions";
import IconButton from "@components/iconButton";
import { linkStateLabels } from "@assets/data";
import Badge from "@components/badge";

import type { DataTableColumn } from "@components/dataTable/types";
import type { PageColumnsOptions } from "./types";
import type { SitePage } from "@utils/types/sitePage";

export const getPageColumns = ({ isCopied, onCopy, onEdit, onRemove, onToggle }: PageColumnsOptions): DataTableColumn<SitePage>[] => [
  {
    key: "page",
    header: "Página",
    render: (sitePage) => (
      <LinkCell>
        <Title>{sitePage.title}</Title>
        <Meta>
          <Slug
            href={publicLinkUrl(sitePage.slug)}
            target="_blank"
            rel="noopener noreferrer"
            title={publicLinkUrl(sitePage.slug)}
            aria-label={`Abrir /${sitePage.slug} em nova aba`}
          >
            /{sitePage.slug}
          </Slug>
          <Host>
            Versão {versionLabel(sitePage.version)} · {formatBytes(sitePage.size)}
          </Host>
        </Meta>
      </LinkCell>
    )
  },
  {
    key: "state",
    header: "Estado",
    render: (sitePage) => {
      const rule = describeLinkRule(sitePage);
      return (
        <StateCell>
          <Badge tone={linkStateLabels[sitePage.state].tone} hasDot>
            {linkStateLabels[sitePage.state].label}
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
    render: (sitePage) => (
      <Clicks>
        {sitePage.clicks.toLocaleString("pt-BR")}
        {sitePage.mode === "clicks" && sitePage.maxClicks !== null && (
          <ClicksLimit> / {sitePage.maxClicks.toLocaleString("pt-BR")}</ClicksLimit>
        )}
      </Clicks>
    )
  },
  {
    key: "actions",
    header: "Ações",
    isHeaderHidden: true,
    align: "right",
    render: (sitePage) => (
      <RowActions>
        <IconButton
          label={isCopied(sitePage.id) ? "URL copiada" : `Copiar a URL de ${sitePage.title}`}
          icon={isCopied(sitePage.id) ? <CheckIcon /> : <CopyIcon />}
          size="sm"
          onClick={() => onCopy(sitePage)}
        />
        <IconButton
          label={sitePage.state === "inactive" ? `Ativar ${sitePage.title}` : `Desativar ${sitePage.title}`}
          icon={sitePage.state === "inactive" ? <PlayIcon /> : <PauseIcon />}
          size="sm"
          onClick={() => onToggle(sitePage)}
        />
        <IconButton label={`Editar ${sitePage.title}`} icon={<Pencil1Icon />} size="sm" onClick={() => onEdit(sitePage)} />
        <IconButton
          label={`Excluir ${sitePage.title}`}
          icon={<TrashIcon />}
          size="sm"
          variant="danger"
          onClick={() => onRemove(sitePage)}
        />
      </RowActions>
    )
  }
];
