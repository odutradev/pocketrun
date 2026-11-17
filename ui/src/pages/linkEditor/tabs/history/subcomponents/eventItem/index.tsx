import { ArrowRightIcon, GearIcon } from "@radix-ui/react-icons";

import { Actor, Avatar, Change, ChangeList, Content, FieldLabel, Headline, Item, NewValue, OldValue, Time, Values } from "./styles";
import { formatRelativeTime, formatShortDateTime, formatTime, getInitials } from "@utils/functions";
import { linkChangeLabels, linkEventLabels, linkModeOptions } from "@assets/data";

import type { LinkChange, LinkChangeValue, LinkEvent } from "@utils/types/link";
import type { EventItemProps } from "./types";

const formatValue = (change: LinkChange, value: LinkChangeValue, groupNames: Record<string, string>) => {
  if (value === null || value === "") return change.field === "groupId" ? "Sem grupo" : "—";
  if (change.field === "mode") return linkModeOptions.find((option) => option.value === value)?.label ?? String(value);
  if (change.field === "groupId") return groupNames[String(value)] ?? "Grupo excluído";
  if (change.field === "startsAt" || change.field === "endsAt") return formatShortDateTime(String(value));
  if (change.field === "maxClicks") return Number(value).toLocaleString("pt-BR");
  return String(value);
};

const describe = (event: LinkEvent) => {
  const modeChange = event.changes.find((change) => change.field === "mode");
  if (event.type !== "updated" || !modeChange || event.changes.length > 1) return linkEventLabels[event.type];
  if (modeChange.to === "inactive") return "desativou o link";
  if (modeChange.from === "inactive") return "reativou o link";
  return linkEventLabels[event.type];
};

const EventItem = ({ event, groupNames, now }: EventItemProps) => {
  const isSystem = event.actor.id === null;
  const isCreation = event.type === "created";
  const changes = event.changes.filter((change) => !isCreation || (change.to !== null && change.to !== ""));

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
            {changes.map((change) => (
              <Change key={change.field}>
                <FieldLabel>{linkChangeLabels[change.field]}</FieldLabel>
                <Values>
                  {!isCreation && (
                    <>
                      <OldValue>{formatValue(change, change.from, groupNames)}</OldValue>
                      <ArrowRightIcon aria-label="para" />
                    </>
                  )}
                  <NewValue>{formatValue(change, change.to, groupNames)}</NewValue>
                </Values>
              </Change>
            ))}
          </ChangeList>
        )}
      </Content>
    </Item>
  );
};

export default EventItem;
