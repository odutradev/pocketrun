import { Tooltip } from "@radix-ui/themes";

import { apiUrl, appVersion } from "@assets/config";
import useSystemStore from "@stores/system";

import { Address, Container, Dot, DotTrigger, TooltipBody, TooltipLabel, TooltipValue } from "./styles";
import type { ApiStatusProps } from "./types";

const statusLabels = { online: "API no ar", offline: "API fora do ar" } as const;

const displayUrl = apiUrl.replace(/^https?:\/\//, "");

// Estado da API com ponto e texto, nunca só pela cor. No "dot" o estado vai no rótulo acessível
// e o tooltip mostra só endereço e versão.
const ApiStatus: React.FC<ApiStatusProps> = ({ variant = "pill" }) => {
  const { apiStatus } = useSystemStore();
  const isOnline = apiStatus === "online";

  if (variant === "dot") {
    const versionLabel = appVersion ? `v${appVersion}` : "desconhecida";
    return (
      <Tooltip
        side="right"
        sideOffset={8}
        content={
          <TooltipBody>
            <TooltipLabel>API</TooltipLabel>
            <TooltipValue>{displayUrl}</TooltipValue>
            <TooltipLabel>Versão</TooltipLabel>
            <TooltipValue>{versionLabel}</TooltipValue>
          </TooltipBody>
        }
      >
        <DotTrigger
          role="status"
          tabIndex={0}
          aria-label={`${statusLabels[apiStatus]}, ${displayUrl}, versão ${versionLabel}`}
        >
          <Dot $isOnline={isOnline} $isPulsing aria-hidden="true" />
        </DotTrigger>
      </Tooltip>
    );
  }

  return (
    <Container role="status" $variant={variant}>
      <Dot $isOnline={isOnline} aria-hidden="true" />
      <span>
        {statusLabels[apiStatus]}
        {variant === "panel" && (
          <>
            {" · "}
            <Address>{displayUrl}</Address>
          </>
        )}
      </span>
    </Container>
  );
};

export default ApiStatus;
