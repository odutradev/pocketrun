import { ArrowRightIcon } from "@radix-ui/react-icons";

import Badge from "@components/badge";
import Card from "@components/card";
import { allowsAnyOrigin, describeOrigins, formatDate, pluralize } from "@utils/functions";

import { Badges, Body, Description, Footer, Identity, Name, ProjectId } from "./styles";
import type { ApplicationCardProps } from "./types";

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const tokenCount = application.tokens?.length ?? 0;
  const isOpenToAnyOrigin = allowsAnyOrigin(application.allowedOrigins);

  return (
    <Card to={`/apps/${application.id}`} aria-label={`Abrir ${application.name}`}>
      <Body>
        <Identity>
          <Name>{application.name}</Name>
          <ProjectId>{application.projectId}</ProjectId>
        </Identity>
        <Description>{application.description || "Sem descrição."}</Description>
        <Badges>
          <Badge tone={tokenCount > 0 ? "neutral" : "warning"} hasDot={tokenCount === 0}>
            {tokenCount > 0 ? pluralize(tokenCount, "token", "tokens") : "Nenhum token"}
          </Badge>
          <Badge tone={isOpenToAnyOrigin ? "warning" : "neutral"} hasDot={isOpenToAnyOrigin}>
            {describeOrigins(application.allowedOrigins)}
          </Badge>
        </Badges>
      </Body>
      <Footer>
        <span>Criada em {formatDate(application.createdAt)}</span>
        <ArrowRightIcon aria-hidden="true" />
      </Footer>
    </Card>
  );
};

export default ApplicationCard;
