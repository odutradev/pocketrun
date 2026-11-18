import { CheckIcon, CopyIcon, PauseIcon, Pencil1Icon, PlayIcon, TrashIcon } from "@radix-ui/react-icons";

import { Actions, Body, CardItem, Clicks, ClicksLabel, Footer, Grid, Header, Host, Rule, Slug, Title, Usage } from "./styles";
import { describeLinkRule, formatBytes, publicLinkUrl, versionLabel } from "@utils/functions";
import IconButton from "@components/iconButton";
import { linkStateLabels } from "@assets/data";
import Badge from "@components/badge";

import type { PageCardsProps } from "./types";

const PageCards = ({ sitePages, isCopied, onCopy, onEdit, onRemove, onToggle, isCompact = false }: PageCardsProps) => (
  <Grid $isCompact={isCompact}>
    {sitePages.map((sitePage) => {
      const rule = describeLinkRule(sitePage);
      const hasLimit = sitePage.mode === "clicks" && sitePage.maxClicks !== null;

      return (
        <CardItem key={sitePage.id} $isCompact={isCompact}>
          <Header>
            <Title title={sitePage.title}>{sitePage.title}</Title>
            <Badge tone={linkStateLabels[sitePage.state].tone} hasDot>
              {linkStateLabels[sitePage.state].label}
            </Badge>
          </Header>
          <Body>
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
          </Body>
          <Footer $isCompact={isCompact}>
            <Usage $isCompact={isCompact}>
              <Clicks $isCompact={isCompact}>
                {sitePage.clicks.toLocaleString("pt-BR")}
                {hasLimit && <ClicksLabel> / {sitePage.maxClicks?.toLocaleString("pt-BR")}</ClicksLabel>}
              </Clicks>
              <Rule>{rule ?? (sitePage.clicks === 1 ? "acesso" : "acessos")}</Rule>
            </Usage>
            <Actions>
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
            </Actions>
          </Footer>
        </CardItem>
      );
    })}
  </Grid>
);

export default PageCards;
