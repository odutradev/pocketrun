import { CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { Action, Body, Icon, Message, Root, Title } from "./styles";

import type { AlertProps, AlertTone } from "./types";
import type { ReactNode } from "react";

const icons: Record<AlertTone, ReactNode> = {
  neutral: <InfoCircledIcon />,
  success: <CheckCircledIcon />,
  warning: <ExclamationTriangleIcon />,
  error: <CrossCircledIcon />
};

const Alert = ({ children, tone = "neutral", title, action, isBanner = false }: AlertProps) => (
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
