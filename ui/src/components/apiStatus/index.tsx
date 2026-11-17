import { Tooltip } from "@radix-ui/themes";

import { apiUrl, appVersion } from "@assets/config";
import useSystemStore from "@stores/system";

import { Address, Container, Dot, DotTrigger, TooltipBody, TooltipLine } from "./styles";
import type { ApiStatusProps } from "./types";

const statusLabels = { online: "API no ar", offline: "API fora do ar" } as const;

const displayUrl = apiUrl.replace(/^https?:\/\//, "");

// Estado da API com ponto e texto, nunca só pela cor. No "dot" o texto vai no tooltip e no rótulo acessível.
const ApiStatus: React.FC<ApiStatusProps> = ({ variant = "pill" }) => {
  const { apiStatus } = useSystemStore();
  const isOnline = apiStatus === "online";

  if (variant === "dot") {
    const versionLabel = appVersion ? `v${appVersion}` : "versão desconhecida";
    return (
      <Tooltip
        side="bottom"
        content={
          <TooltipBody>
            <TooltipLine>{statusLabels[apiStatus]}</TooltipLine>
            <Address>{displayUrl}</Address>
            <TooltipLine>PocketRun {versionLabel}</TooltipLine>
          </TooltipBody>
        }
      >
        <DotTrigger
          role="status"
          tabIndex={0}
          aria-label={`${statusLabels[apiStatus]}, ${displayUrl}, PocketRun ${versionLabel}`}
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
