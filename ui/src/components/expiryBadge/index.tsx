import Badge from "@components/badge";
import { formatDate, getExpiryInfo, pluralize } from "@utils/functions";

import { MutedText } from "./styles";
import type { ExpiryBadgeProps } from "./types";

// Situação de validade: perto de expirar em laranja, expirado em vermelho, sempre com texto.
const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({ expiresAt, noneLabel, isStatus = false }) => {
  const { state, days = 0 } = getExpiryInfo(expiresAt);

  if (state === "expired") {
    return (
      <Badge tone="error" hasDot>
        Expirado
      </Badge>
    );
  }

  if (state === "soon") {
    return (
      <Badge tone="warning" hasDot>
        Expira em {pluralize(days, "dia", "dias")}
      </Badge>
    );
  }

  if (isStatus) {
    return (
      <Badge tone="success" hasDot>
        Ativo
      </Badge>
    );
  }

  return <MutedText>{expiresAt ? `Até ${formatDate(expiresAt)}` : noneLabel}</MutedText>;
};

export default ExpiryBadge;
