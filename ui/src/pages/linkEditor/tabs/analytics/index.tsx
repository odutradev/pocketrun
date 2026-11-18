import { DownloadIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import { currentTimestamp, downloadCsv, formatPercentChange, formatRelativeTime, formatShortDateTime, pluralize } from "@utils/functions";
import { BotNote, Container, Panel, PanelTitle, Progress, ProgressBar, ProgressText, Row, Stats, Toolbar, Trio } from "./styles";
import SegmentedControl from "@components/segmentedControl";
import ActivityHeatmap from "@components/activityHeatmap";
import { analyticsRangeOptions } from "@assets/data";
import DevicesChart from "@components/devicesChart";
import ClicksChart from "@components/clicksChart";
import EmptyState from "@components/emptyState";
import ShareList from "@components/shareList";
import Skeleton from "@components/skeleton";
import StatCard from "@components/statCard";
import useLinkEditorPage from "../../hook";
import Button from "@components/button";

import type { Link, LinkAnalytics } from "@utils/types/link";

const dayMs = 86400000;

const daysIn = (analytics: LinkAnalytics) =>
  Math.max(1, (new Date(analytics.to).getTime() - new Date(analytics.from).getTime()) / dayMs);

const describeLimit = (link: Link, analytics: LinkAnalytics, now: number) => {
  if (link.mode === "clicks" && link.maxClicks !== null) {
    const used = Math.min(100, Math.round((link.clicks / link.maxClicks) * 100));
    const remaining = Math.max(0, link.maxClicks - link.clicks);
    const perDay = analytics.totals.clicks / daysIn(analytics);
    const estimate =
      remaining === 0
        ? "Limite atingido. O link não redireciona mais."
        : perDay > 0
          ? `No ritmo atual, o limite acaba ${formatRelativeTime(new Date(now + (remaining / perDay) * dayMs).toISOString(), now)}.`
          : "Sem cliques recentes para estimar quando o limite acaba.";
    return {
      label: `${link.clicks.toLocaleString("pt-BR")} de ${link.maxClicks.toLocaleString("pt-BR")} acessos usados`,
      percent: used,
      detail: estimate
    };
  }

  if (link.mode === "period" && link.endsAt) {
    const start = new Date(link.startsAt ?? link.createdAt).getTime();
    const end = new Date(link.endsAt).getTime();
    const percent = Math.min(100, Math.max(0, Math.round(((now - start) / Math.max(1, end - start)) * 100)));
    return {
      label: now >= end ? `Terminou ${formatShortDateTime(link.endsAt)}` : `Termina ${formatShortDateTime(link.endsAt)}`,
      percent,
      detail: now >= end ? "O período acabou e o link não redireciona mais." : `Faltam ${formatRelativeTime(link.endsAt, now).replace(/^em /, "")}.`
    };
  }

  return null;
};

const AnalyticsTab = () => {
  const {
    link,
    analytics,
    range,
    isAnalyticsLoading,
    events,
    historyPage,
    hasLoadedHistory,
    loadAnalytics,
    loadHistory,
    handleRangeChange
  } = useLinkEditorPage();

  useEffect(() => {
    loadAnalytics();
  }, [range, loadAnalytics]);

  useEffect(() => {
    if (!hasLoadedHistory || historyPage !== 1) loadHistory(1);
  }, [hasLoadedHistory, historyPage, loadHistory]);

  const toolbar = (
    <Toolbar>
      <SegmentedControl label="Período da análise" options={analyticsRangeOptions} value={range} onValueChange={handleRangeChange} isFullWidth />
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<DownloadIcon />}
        disabled={!analytics || analytics.series.length === 0}
        onClick={() =>
          analytics &&
          link &&
          downloadCsv(`${link.slug}-${analytics.range}.csv`, [
            ["Início do intervalo", "Cliques", "Visitantes únicos"],
            ...analytics.series.map((point) => [new Date(point.at).toLocaleString("pt-BR"), point.clicks, point.visitors])
          ])
        }
      >
        Exportar CSV
      </Button>
    </Toolbar>
  );

  if (!link || !analytics) {
    return (
      <Container aria-busy="true">
        {toolbar}
        <Stats>
          <Skeleton height="112px" radius="panel" />
          <Skeleton height="112px" radius="panel" />
          <Skeleton height="112px" radius="panel" />
          <Skeleton height="112px" radius="panel" />
        </Stats>
        <Skeleton height="340px" radius="panel" />
      </Container>
    );
  }

  const now = currentTimestamp();
  const { totals } = analytics;
  const limit = describeLimit(link, analytics, now);
  const perDay = totals.clicks / daysIn(analytics);
  const markers = events.filter((event) => event.type === "updated" || event.type === "created");

  return (
    <Container aria-busy={isAnalyticsLoading}>
      {toolbar}
      <Stats>
        <StatCard label="Cliques" value={totals.clicks.toLocaleString("pt-BR")} hint={formatPercentChange(totals.clicks, totals.previousClicks)} />
        <StatCard
          label="Visitantes únicos"
          value={totals.visitors.toLocaleString("pt-BR")}
          hint={formatPercentChange(totals.visitors, totals.previousVisitors) ?? "Contados uma vez por dia"}
        />
        <StatCard
          label="Média por dia"
          value={perDay.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
          hint={analytics.range === "all" ? "Desde a criação do link" : "No período escolhido"}
        />
        <StatCard
          label="Último clique"
          isTextValue
          value={analytics.lastClickAt ? formatRelativeTime(analytics.lastClickAt, now) : "—"}
          hint={analytics.lastClickAt ? formatShortDateTime(analytics.lastClickAt) : "Nenhum clique no período"}
        />
      </Stats>
      {limit && (
        <Progress>
          <ProgressText>
            <strong>{limit.label}</strong>
            <span>{limit.detail}</span>
          </ProgressText>
          <ProgressBar role="progressbar" aria-valuenow={limit.percent} aria-valuemin={0} aria-valuemax={100} aria-label={limit.label}>
            <span style={{ width: `${limit.percent}%` }} />
          </ProgressBar>
        </Progress>
      )}
      {totals.clicks === 0 ? (
        <EmptyState
          isCompact
          title="Nenhum clique no período"
          description="Quando alguém abrir o link, os gráficos de horário, origem e dispositivo aparecem aqui."
        />
      ) : (
        <>
          <Panel>
            <PanelTitle>Cliques ao longo do tempo</PanelTitle>
            <ClicksChart series={analytics.series} bucket={analytics.bucket} markers={markers} />
          </Panel>
          <Row>
            <Panel>
              <PanelTitle>Quando acessam</PanelTitle>
              <ActivityHeatmap cells={analytics.heatmap} />
            </Panel>
            <Panel>
              <PanelTitle>De onde vêm</PanelTitle>
              <ShareList title="Origens" items={analytics.referrers} />
            </Panel>
          </Row>
          <Panel>
            <PanelTitle>Como acessam</PanelTitle>
            <Trio>
              <DevicesChart devices={analytics.devices} />
              <ShareList title="Sistemas" items={analytics.systems} />
              <ShareList title="Navegadores" items={analytics.browsers} />
            </Trio>
          </Panel>
        </>
      )}
      {totals.bots > 0 && (
        <BotNote>
          {pluralize(totals.bots, "acesso de robô ou prévia de link ficou", "acessos de robôs ou prévias de link ficaram")} fora dos
          números.
        </BotNote>
      )}
    </Container>
  );
};

export default AnalyticsTab;
