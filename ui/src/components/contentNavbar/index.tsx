import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Tooltip } from "@radix-ui/themes";

import { Actions, Container, Heading, InfoTrigger, ReloadIconSlot, Title, TooltipText } from "./styles";
import IconButton from "@components/iconButton";
import LinkButton from "@components/linkButton";
import Button from "@components/button";

import type { ContentNavbarProps } from "./types";

const ContentNavbar = ({ title, info, actions, action, onReload, isReloading = false }: ContentNavbarProps) => {
  const defaultActions = (onReload || action) && (
    <>
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
      {action?.to && !action.isDisabled ? (
        <LinkButton to={action.to} variant="primary" leftIcon={action.icon}>
          {action.label}
        </LinkButton>
      ) : (
        action && (
          <Button leftIcon={action.icon} onClick={action.onClick} disabled={action.isDisabled}>
            {action.label}
          </Button>
        )
      )}
    </>
  );
  const rightSide = actions ?? defaultActions;

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
      {rightSide && <Actions>{rightSide}</Actions>}
    </Container>
  );
};

export default ContentNavbar;
