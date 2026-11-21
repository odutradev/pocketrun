import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "styled-components";

import { Empty, Summary, SummaryChange, SummaryItem, SummaryLabel, SummaryValue, Swatch, TooltipBox, TooltipRow, TooltipTitle } from "./styles";
import { Panel, PanelHeader, PanelHint, PanelTitle } from "../../styles";
import { formatPercentChange } from "@utils/functions";
import useOverviewPage from "../../hook";

import type { UsageChartPoint, UsageSeries } from "./types";
import type { AnalyticsBucket } from "@utils/types/link";

const formatTick = (time: number, bucket: AnalyticsBucket) =>
  new Date(time).toLocaleString("pt-BR", bucket === "hour" ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit" });

const formatTooltipTitle = (time: number, bucket: AnalyticsBucket) => {
  const date = new Date(time);
  if (bucket === "hour") return date.toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  if (bucket === "week") return `Semana de ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
};

const UsageChart = () => {
  const theme = useTheme();
  const { overview, rangeLabel } = useOverviewPage();
  if (!overview) return null;

  const { usage } = overview;
  const series: UsageSeries[] = [
    { key: "kv", tool: "data", label: "Pedidos ao KV", total: usage.totals.kv, previous: usage.totals.previousKv },
    { key: "pages", tool: "content", label: "Acessos às páginas", total: usage.totals.pages, previous: usage.totals.previousPages },
    { key: "links", tool: "links", label: "Cliques nos links", total: usage.totals.links, previous: usage.totals.previousLinks }
  ];
  const data: UsageChartPoint[] = usage.series.map((point) => ({ time: new Date(point.at).getTime(), pages: point.pages, links: point.links, kv: point.kv }));
  const hasUsage = series.some((item) => item.total > 0);
  const colorOf = (item: UsageSeries) => theme.brand.tools[item.tool].base;

  return (
    <Panel aria-labelledby="overview-usage-title">
      <PanelHeader>
        <PanelTitle id="overview-usage-title">Uso dos serviços</PanelTitle>
        <PanelHint>{rangeLabel}</PanelHint>
      </PanelHeader>
      <Summary>
        {series.map((item) => (
          <SummaryItem key={item.key}>
            <SummaryLabel>
              <Swatch $color={colorOf(item)} aria-hidden="true" />
              {item.label}
            </SummaryLabel>
            <SummaryValue $color={theme.brand.tools[item.tool].text}>{item.total.toLocaleString("pt-BR")}</SummaryValue>
            <SummaryChange>{formatPercentChange(item.total, item.previous) ?? "Sem comparação"}</SummaryChange>
          </SummaryItem>
        ))}
      </Summary>
      {hasUsage ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke={theme.brand.border} strokeDasharray="3 4" />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(time: number) => formatTick(time, usage.bucket)}
              tick={{ fill: theme.brand.steelMuted, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: theme.brand.border }}
              minTickGap={24}
            />
            <YAxis allowDecimals={false} tick={{ fill: theme.brand.steelMuted, fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              cursor={{ stroke: theme.brand.strongBorder, strokeWidth: 1 }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as UsageChartPoint | undefined;
                if (!active || !point) return null;
                return (
                  <TooltipBox>
                    <TooltipTitle>{formatTooltipTitle(point.time, usage.bucket)}</TooltipTitle>
                    {series.map((item) => (
                      <TooltipRow key={item.key}>
                        <Swatch $color={colorOf(item)} />
                        {item.label} <strong>{point[item.key].toLocaleString("pt-BR")}</strong>
                      </TooltipRow>
                    ))}
                  </TooltipBox>
                );
              }}
            />
            {series.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={colorOf(item)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: theme.brand.surface, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Empty>Nenhum uso no período. Os pedidos ao KV, os acessos às páginas e os cliques nos links aparecem aqui.</Empty>
      )}
    </Panel>
  );
};

export default UsageChart;
