import { CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";

import { Action, Body, Icon, Message, Root, Title } from "./styles";
import type { AlertProps, AlertTone } from "./types";

const icons: Record<AlertTone, ReactNode> = {
  neutral: <InfoCircledIcon />,
  success: <CheckCircledIcon />,
  warning: <ExclamationTriangleIcon />,
  error: <CrossCircledIcon />
};

// Aviso na própria tela. Erro é anunciado na hora; os outros tons, com educação.
const Alert: React.FC<AlertProps> = ({ children, tone = "neutral", title, action, isBanner = false }) => (
  <Root role={tone === "error" ? "alert" : "status"} $tone={tone} $isBanner={isBanner}>
    <Icon $tone={tone} aria-hidden="true">
      {icons[tone]}
    </Icon>
    <Body $isBanner={isBanner}>
      {title && <Title>{title}</Title>}
      <Message>{children}</Message>
    </Body>
    {action && <Action>{action}</Action>}
  </Root>
);

export default Alert;
