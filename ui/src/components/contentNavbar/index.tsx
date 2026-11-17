import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Tooltip } from "@radix-ui/themes";

import { Actions, Container, Heading, InfoTrigger, ReloadIconSlot, Title, TooltipText } from "./styles";
import IconButton from "@components/iconButton";
import LinkButton from "@components/linkButton";
import Button from "@components/button";

import type { ContentNavbarProps } from "./types";

const ContentNavbar = ({ title, info, actions, action, onReload, isReloading = false }: ContentNavbarProps) => {
  const hasActions = Boolean(actions || onReload || action);
  const isActionLink = Boolean(action?.to && !action.isDisabled);

  return (
    <Container>
      <Heading>
        <Title>{title}</Title>
        {info && (
          <Tooltip content={<TooltipText>{info}</TooltipText>} side="bottom" sideOffset={6}>
            <InfoTrigger type="button" aria-label={`Sobre ${title}`}>
              <InfoCircledIcon />
            </InfoTrigger>
          </Tooltip>
        )}
      </Heading>
      {hasActions && (
        <Actions>
          {actions}
          {onReload && (
            <IconButton
              label="Recarregar"
              variant="secondary"
              icon={
                <ReloadIconSlot $isSpinning={isReloading}>
                  <ReloadIcon />
                </ReloadIconSlot>
              }
              onClick={onReload}
              disabled={isReloading}
            />
          )}
          {action && isActionLink && (
            <LinkButton to={action.to} variant="primary" leftIcon={action.icon}>
              {action.label}
            </LinkButton>
          )}
          {action && !isActionLink && (
            <Button leftIcon={action.icon} onClick={action.onClick} disabled={action.isDisabled}>
              {action.label}
            </Button>
          )}
        </Actions>
      )}
    </Container>
  );
};

export default ContentNavbar;
