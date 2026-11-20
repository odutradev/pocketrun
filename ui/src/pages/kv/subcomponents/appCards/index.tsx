import { CheckIcon, CopyIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

import { Actions, Body, CardItem, Description, Footer, Grid, Header, ProjectId, Rule, Title, Tokens, TokensLabel, Usage } from "./styles";
import { allowsAnyOrigin, countTokens, describeLastUse, describeOrigins } from "@utils/functions";
import IconButton from "@components/iconButton";
import Badge from "@components/badge";

import type { AppCardsProps } from "./types";

const AppCards = ({ applications, isCopied, onCopy, onEdit, onRemove, isCompact = false }: AppCardsProps) => (
  <Grid $isCompact={isCompact}>
    {applications.map((application) => {
      const isOpen = allowsAnyOrigin(application.allowedOrigins);
      const tokenCount = countTokens(application);

      return (
        <CardItem key={application.id} $isCompact={isCompact}>
          <Header>
            <Title title={application.name}>{application.name}</Title>
            {application.pageId ? (
              <Badge tone="accent">Da página</Badge>
            ) : (
              <Badge tone={isOpen ? "warning" : "neutral"} hasDot={isOpen}>
                {describeOrigins(application.allowedOrigins)}
              </Badge>
            )}
          </Header>
          <Body>
            <ProjectId>{application.projectId}</ProjectId>
            {application.description && <Description title={application.description}>{application.description}</Description>}
          </Body>
          <Footer $isCompact={isCompact}>
            <Usage $isCompact={isCompact}>
              <Tokens $isCompact={isCompact}>
                {tokenCount}
                <TokensLabel> {tokenCount === 1 ? "token" : "tokens"}</TokensLabel>
              </Tokens>
              <Rule>{describeLastUse(application)}</Rule>
            </Usage>
            <Actions>
              <IconButton
                label={isCopied(application.id) ? "Project ID copiado" : `Copiar o Project ID de ${application.name}`}
                icon={isCopied(application.id) ? <CheckIcon /> : <CopyIcon />}
                size="sm"
                onClick={() => onCopy(application)}
              />
              <IconButton label={`Abrir ${application.name}`} icon={<Pencil1Icon />} size="sm" onClick={() => onEdit(application)} />
              {!application.pageId && (
                <IconButton
                  label={`Excluir ${application.name}`}
                  icon={<TrashIcon />}
                  size="sm"
                  variant="danger"
                  onClick={() => onRemove(application)}
                />
              )}
            </Actions>
          </Footer>
        </CardItem>
      );
    })}
  </Grid>
);

export default AppCards;
