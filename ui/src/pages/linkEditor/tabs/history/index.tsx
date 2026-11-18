import { useEffect, useLayoutEffect, useRef } from "react";
import { useTheme } from "styled-components";

import { ActorSelect, Container, Count, Day, DayHeading, Filters, FiltersAside, Timeline, TimelineFrame } from "./styles";
import { currentTimestamp, formatDayHeading, pluralize, toDayKey } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import { historyFilterOptions } from "@assets/data";
import EventItem from "./subcomponents/eventItem";
import useMediaQuery from "@hooks/useMediaQuery";
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
  const { motion } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const previousHeight = useRef<number | null>(null);
  const shouldReduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
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

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const fromHeight = previousHeight.current;
    if (isHistoryLoading || !frame || fromHeight === null) return;
    previousHeight.current = null;

    const toHeight = frame.offsetHeight;
    if (shouldReduceMotion || fromHeight === toHeight) return;

    frame.style.overflow = "hidden";
    const animation = frame.animate([{ height: `${fromHeight}px` }, { height: `${toHeight}px` }], {
      duration: motion.base,
      easing: motion.easing.standard
    });
    const releaseOverflow = () => frame.style.removeProperty("overflow");
    animation.onfinish = releaseOverflow;
    animation.oncancel = releaseOverflow;
  }, [historyPage, isHistoryLoading, shouldReduceMotion, motion]);

  const handlePageChange = (page: number) => {
    previousHeight.current = frameRef.current?.offsetHeight ?? null;
    handleHistoryPageChange(page);
    containerRef.current?.scrollIntoView({ block: "start", behavior: shouldReduceMotion ? "auto" : "smooth" });
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
    if (visibleEvents.length === 0) {
      return (
        <EmptyState isCompact title="Nada com esse filtro" description="Nenhuma alteração desta página combina com o filtro escolhido." />
      );
    }
    return (
      <Timeline key={historyPage}>
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
      <TimelineFrame ref={frameRef} aria-busy={isHistoryLoading} $isBusy={isHistoryLoading}>
        {renderTimeline()}
      </TimelineFrame>
      {historyTotalPages > 1 && (
        <Pagination page={historyPage} totalPages={historyTotalPages} onPageChange={handlePageChange} isCentered />
      )}
    </Container>
  );
};

export default HistoryTab;
