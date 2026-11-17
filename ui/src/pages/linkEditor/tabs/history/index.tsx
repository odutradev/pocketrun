import { useEffect } from "react";

import { currentTimestamp, formatDayHeading, pluralize, toDayKey } from "@utils/functions";
import { Container, Day, DayHeading, Filters, Footer, Timeline } from "./styles";
import SegmentedControl from "@components/segmentedControl";
import { historyFilterOptions } from "@assets/data";
import EventItem from "./subcomponents/eventItem";
import EmptyState from "@components/emptyState";
import Skeleton from "@components/skeleton";
import useLinkEditorPage from "../../hook";
import Button from "@components/button";
import Select from "@components/select";

import type { LinkEvent } from "@utils/types/link";
import type { HistoryDay } from "./types";

const groupByDay = (events: LinkEvent[]) =>
  events.reduce<HistoryDay[]>((days, event) => {
    const key = toDayKey(event.at);
    const last = days.at(-1);
    if (last && last.key === key) return [...days.slice(0, -1), { ...last, events: [...last.events, event] }];
    return [...days, { key, at: event.at, events: [event] }];
  }, []);

const HistoryTab = () => {
  const {
    events,
    visibleEvents,
    actorOptions,
    groupNames,
    nextCursor,
    hasLoadedHistory,
    isHistoryLoading,
    isHistoryLoadingMore,
    historyFilter,
    historyActor,
    loadHistory,
    handleHistoryFilterChange,
    handleHistoryActorChange
  } = useLinkEditorPage();

  useEffect(() => {
    if (!hasLoadedHistory) loadHistory();
  }, [hasLoadedHistory, loadHistory]);

  if (!hasLoadedHistory || isHistoryLoading) {
    return (
      <Container aria-busy="true">
        <Skeleton height="40px" />
        <Skeleton height="96px" radius="panel" />
        <Skeleton height="96px" radius="panel" />
      </Container>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        isCompact
        title="Nenhuma alteração registrada"
        description="As próximas mudanças neste link aparecem aqui, com quem alterou e o que mudou."
      />
    );
  }

  const now = currentTimestamp();

  return (
    <Container>
      <Filters>
        <SegmentedControl label="Filtrar por autor" options={historyFilterOptions} value={historyFilter} onValueChange={handleHistoryFilterChange} />
        {actorOptions.length > 2 && (
          <Select label="Pessoa" isLabelHidden options={actorOptions} value={historyActor} onValueChange={handleHistoryActorChange} />
        )}
      </Filters>
      {visibleEvents.length === 0 ? (
        <EmptyState isCompact title="Nada com esse filtro" description="Nenhuma alteração carregada combina com o filtro escolhido." />
      ) : (
        <Timeline>
          {groupByDay(visibleEvents).map((day) => (
            <Day key={day.key}>
              <DayHeading>{formatDayHeading(day.at, now)}</DayHeading>
              <ol>
                {day.events.map((event) => (
                  <EventItem key={event.id} event={event} groupNames={groupNames} now={now} />
                ))}
              </ol>
            </Day>
          ))}
        </Timeline>
      )}
      <Footer>
        <span>{pluralize(events.length, "alteração carregada", "alterações carregadas")}</span>
        {nextCursor && (
          <Button variant="secondary" size="sm" isLoading={isHistoryLoadingMore} loadingLabel="Carregando…" onClick={() => loadHistory(true)}>
            Carregar mais
          </Button>
        )}
      </Footer>
    </Container>
  );
};

export default HistoryTab;
