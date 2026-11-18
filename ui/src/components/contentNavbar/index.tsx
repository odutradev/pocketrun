import { ChevronRightIcon, InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useTheme } from "styled-components";
import { Tooltip } from "@radix-ui/themes";

import { Actions, Container, Heading, InfoTrigger, ParentLink, ReloadIconSlot, Separator, Title, TooltipText, Trail, TrailItem } from "./styles";
import useMediaQuery from "@hooks/useMediaQuery";
import IconButton from "@components/iconButton";
import LinkButton from "@components/linkButton";
import Button from "@components/button";

import type { ContentNavbarAction, ContentNavbarProps } from "./types";

const renderAction = (action: ContentNavbarAction, fallbackVariant: "primary" | "secondary", isIconOnly: boolean) => {
  const variant = action.variant ?? fallbackVariant;

  if (action.to && !action.isDisabled) {
    return (
      <LinkButton key={action.label} to={action.to} variant={variant} leftIcon={action.icon} isIconOnly={isIconOnly}>
        {action.label}
      </LinkButton>
    );
  }

  return (
    <Button
      key={action.label}
      variant={variant}
      leftIcon={action.icon}
      onClick={action.onClick}
      disabled={action.isDisabled}
      isIconOnly={isIconOnly}
    >
      {action.label}
    </Button>
  );
};

const ContentNavbar = ({ title, parents = [], info, actions = [], action, onReload, isReloading = false }: ContentNavbarProps) => {
  const { breakpoints } = useTheme();
  const isCompact = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const hasActions = Boolean(actions.length > 0 || onReload || action);

  return (
    <Container>
      <Heading>
        {parents.length > 0 && (
          <Trail aria-label="Caminho">
            <ol>
              {parents.map((parent) => (
                <TrailItem key={parent.to}>
                  <ParentLink to={parent.to} title={parent.label}>
                    {parent.label}
                  </ParentLink>
                  <Separator aria-hidden="true">
                    <ChevronRightIcon />
                  </Separator>
                </TrailItem>
              ))}
            </ol>
          </Trail>
        )}
        <Title title={title} $isCurrentCrumb={parents.length > 0}>
          {title}
        </Title>
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
          {actions.map((item) => renderAction(item, "secondary", isCompact))}
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
          {action && renderAction(action, "primary", false)}
        </Actions>
      )}
    </Container>
  );
};

export default ContentNavbar;
