import { useEffect, useRef } from "react";

import { ActorSelect, Container, Count, Day, DayHeading, Filters, FiltersAside, Timeline } from "./styles";
import { currentTimestamp, formatDayHeading, pluralize, toDayKey } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import { historyFilterOptions } from "@assets/data";
import EventItem from "./subcomponents/eventItem";
import Pagination from "@components/pagination";
import EmptyState from "@components/emptyState";
import Skeleton from "@components/skeleton";
import useLinkEditorPage from "../../hook";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    visibleEvents,
    actorOptions,
    groupNames,
    historyPage,
    historyTotal,
    historyTotalPages,
    hasLoadedHistory,
    isHistoryLoading,
    historyFilter,
    historyActor,
    loadHistory,
    handleHistoryPageChange,
    handleHistoryFilterChange,
    handleHistoryActorChange
  } = useLinkEditorPage();

  useEffect(() => {
    if (!hasLoadedHistory) loadHistory();
  }, [hasLoadedHistory, loadHistory]);

  const handlePageChange = (page: number) => {
    handleHistoryPageChange(page);
    containerRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  if (!hasLoadedHistory) {
    return (
      <Container aria-busy="true">
        <Skeleton height="40px" />
        <Skeleton height="96px" radius="panel" />
        <Skeleton height="96px" radius="panel" />
      </Container>
    );
  }

  if (historyTotal === 0) {
    return (
      <EmptyState
        isCompact
        title="Nenhuma alteração registrada"
        description="As próximas mudanças neste link aparecem aqui, com quem alterou e o que mudou."
      />
    );
  }

  const now = currentTimestamp();

  const renderTimeline = () => {
    if (isHistoryLoading) {
      return (
        <Timeline aria-busy="true">
          <Skeleton height="96px" radius="panel" />
          <Skeleton height="96px" radius="panel" />
        </Timeline>
      );
    }
    if (visibleEvents.length === 0) {
      return (
        <EmptyState isCompact title="Nada com esse filtro" description="Nenhuma alteração desta página combina com o filtro escolhido." />
      );
    }
    return (
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
    );
  };

  return (
    <Container ref={containerRef}>
      <Filters>
        <SegmentedControl label="Filtrar por autor" options={historyFilterOptions} value={historyFilter} onValueChange={handleHistoryFilterChange} />
        <FiltersAside>
          <Count>{pluralize(historyTotal, "alteração", "alterações")}</Count>
          {actorOptions.length > 2 && (
            <ActorSelect>
              <Select label="Pessoa" isLabelHidden options={actorOptions} value={historyActor} onValueChange={handleHistoryActorChange} />
            </ActorSelect>
          )}
        </FiltersAside>
      </Filters>
      {renderTimeline()}
      {historyTotalPages > 1 && <Pagination page={historyPage} totalPages={historyTotalPages} onPageChange={handlePageChange} />}
    </Container>
  );
};

export default HistoryTab;
