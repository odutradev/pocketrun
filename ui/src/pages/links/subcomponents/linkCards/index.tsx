import { CheckIcon, CopyIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

import { Actions, Body, CardItem, Clicks, ClicksLabel, Footer, Grid, Group, Header, Host, Rule, Slug, Title, Usage } from "./styles";
import { describeLinkRule, urlHost } from "@utils/functions";
import IconButton from "@components/iconButton";
import { linkStateLabels } from "@assets/data";
import Badge from "@components/badge";

import type { LinkCardsProps } from "./types";

const LinkCards = ({ links, groupNames, isCopied, onCopy, onEdit, onRemove, isCompact = false }: LinkCardsProps) => (
  <Grid $isCompact={isCompact}>
    {links.map((link) => {
      const rule = describeLinkRule(link);
      const hasLimit = link.mode === "clicks" && link.maxClicks !== null;

      return (
        <CardItem key={link.id} $isCompact={isCompact}>
          <Header>
            <Title title={link.title}>{link.title}</Title>
            <Badge tone={linkStateLabels[link.state].tone} hasDot>
              {linkStateLabels[link.state].label}
            </Badge>
          </Header>
          <Body>
            <Slug>/{link.slug}</Slug>
            <Host title={link.url}>{urlHost(link.url)}</Host>
            {link.groupId && groupNames[link.groupId] && <Group>{groupNames[link.groupId]}</Group>}
          </Body>
          <Footer $isCompact={isCompact}>
            <Usage $isCompact={isCompact}>
              <Clicks $isCompact={isCompact}>
                {link.clicks.toLocaleString("pt-BR")}
                {hasLimit && <ClicksLabel> / {link.maxClicks?.toLocaleString("pt-BR")}</ClicksLabel>}
              </Clicks>
              <Rule>{rule ?? (link.clicks === 1 ? "acesso" : "acessos")}</Rule>
            </Usage>
            <Actions>
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
            </Actions>
          </Footer>
        </CardItem>
      );
    })}
  </Grid>
);

export default LinkCards;
