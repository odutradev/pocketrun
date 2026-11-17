import { apiUrl } from "@assets/config";
import useSystemStore from "@stores/system";

import { Address, Container, Dot } from "./styles";
import type { ApiStatusProps } from "./types";

const statusLabels = { online: "API no ar", offline: "API fora do ar" } as const;

// Estado da API com ponto e texto, nunca só pela cor.
const ApiStatus: React.FC<ApiStatusProps> = ({ variant = "pill" }) => {
  const { apiStatus } = useSystemStore();

  return (
    <Container role="status" $variant={variant}>
      <Dot $isOnline={apiStatus === "online"} aria-hidden="true" />
      <span>
        {statusLabels[apiStatus]}
        {variant === "panel" && (
          <>
            {" · "}
            <Address>{apiUrl.replace(/^https?:\/\//, "")}</Address>
          </>
        )}
      </span>
    </Container>
  );
};

export default ApiStatus;
