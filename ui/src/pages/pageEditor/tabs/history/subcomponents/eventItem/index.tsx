import { ArrowRightIcon, GearIcon } from "@radix-ui/react-icons";

import {
  Actor,
  Avatar,
  Change,
  ChangeList,
  Content,
  FieldLabel,
  Headline,
  Item,
  NewValue,
  OldValue,
  Time,
  Values,
  ValueTag
} from "./styles";
import { formatRelativeTime, formatShortDateTime, formatTime, getInitials } from "@utils/functions";
import { pageChangeLabels, pageEventLabels, linkModeOptions } from "@assets/data";

import type { PageChange, LinkChangeValue, PageEvent } from "@utils/types/sitePage";
import type { EventItemProps } from "./types";

const isEmptyValue = (value: LinkChangeValue) => value === null || value === "";

const formatValue = (change: PageChange, value: LinkChangeValue, groupNames: Record<string, string>) => {
  if (isEmptyValue(value)) return change.field === "groupId" ? "Sem grupo" : "—";
  if (change.field === "mode") return linkModeOptions.find((option) => option.value === value)?.label ?? String(value);
  if (change.field === "groupId") return groupNames[String(value)] ?? "Grupo excluído";
  if (change.field === "startsAt" || change.field === "endsAt") return formatShortDateTime(String(value));
  if (change.field === "maxClicks") return Number(value).toLocaleString("pt-BR");
  return String(value);
};

const describe = (event: PageEvent) => {
  const modeChange = event.changes.find((change) => change.field === "mode");
  if (event.type !== "updated" || !modeChange || event.changes.length > 1) return pageEventLabels[event.type];
  if (modeChange.to === "inactive") return "desativou a página";
  if (modeChange.from === "inactive") return "reativou a página";
  return pageEventLabels[event.type];
};

const EventItem = ({ event, groupNames, now }: EventItemProps) => {
  const isSystem = event.actor.id === null;
  const isCreation = event.type === "created";
  const changes = event.changes.filter((change) => !isCreation || !isEmptyValue(change.to));

  return (
    <Item>
      <Avatar $isSystem={isSystem} aria-hidden="true">
        {isSystem ? <GearIcon /> : getInitials(event.actor.name)}
      </Avatar>
      <Content>
        <Headline>
          <Actor title={event.actor.email || undefined}>{event.actor.name}</Actor> {describe(event)}
          <Time dateTime={event.at} title={new Date(event.at).toLocaleString("pt-BR")}>
            {formatTime(event.at)} · {formatRelativeTime(event.at, now)}
          </Time>
        </Headline>
        {changes.length > 0 && (
          <ChangeList>
            {changes.map((change) => {
              const hasLabelForEmpty = change.field === "groupId";
              const wasEmpty = !isCreation && !hasLabelForEmpty && isEmptyValue(change.from);
              const isCleared = !hasLabelForEmpty && isEmptyValue(change.to);

              return (
                <Change key={change.field}>
                  <FieldLabel>{pageChangeLabels[change.field]}</FieldLabel>
                  <Values>
                    {!isCreation && !wasEmpty && (
                      <>
                        <OldValue>{formatValue(change, change.from, groupNames)}</OldValue>
                        <ArrowRightIcon aria-label="para" />
                      </>
                    )}
                    {isCleared ? (
                      <ValueTag $tone="removed">removido</ValueTag>
                    ) : (
                      <NewValue>{formatValue(change, change.to, groupNames)}</NewValue>
                    )}
                    {wasEmpty && !isCleared && <ValueTag $tone="added">definido</ValueTag>}
                  </Values>
                </Change>
              );
            })}
          </ChangeList>
        )}
      </Content>
    </Item>
  );
};

export default EventItem;
