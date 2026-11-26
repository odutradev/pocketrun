import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "styled-components";

import { clickSeriesLabels } from "@assets/data";
import { Legend, LegendItem, Swatch, TooltipBox, TooltipRow, TooltipTitle, Wrapper } from "./styles";

import type { ChartPoint, ClicksChartProps } from "./types";
import type { AnalyticsBucket } from "@utils/types/link";

const formatTick = (time: number, bucket: AnalyticsBucket) =>
  new Date(time).toLocaleString(
    "pt-BR",
    bucket === "hour" ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit" }
  );

const formatTooltipTitle = (time: number, bucket: AnalyticsBucket) => {
  const date = new Date(time);
  if (bucket === "hour") return date.toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  if (bucket === "week") return `Semana de ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
};

const ClicksChart = ({ series, bucket, markers, labels = clickSeriesLabels }: ClicksChartProps) => {
  const theme = useTheme();
  const data: ChartPoint[] = series.map((point) => ({ time: new Date(point.at).getTime(), clicks: point.clicks, visitors: point.visitors }));
  const firstTime = data[0]?.time ?? 0;
  const lastTime = data.at(-1)?.time ?? 0;
  const visibleMarkers = markers.filter((event) => {
    const time = new Date(event.at).getTime();
    return time >= firstTime && time <= lastTime;
  });

  return (
    <Wrapper>
      <Legend>
        <LegendItem>
          <Swatch $color={theme.brand.chart.clicks} />
          {labels.clicks}
        </LegendItem>
        <LegendItem>
          <Swatch $color={theme.brand.chart.visitors} />
          {labels.visitors}
        </LegendItem>
        {visibleMarkers.length > 0 && (
          <LegendItem>
            <Swatch $color={theme.brand.chart.marker} $isDashed />
            Alterações no link
          </LegendItem>
        )}
      </Legend>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.brand.chart.clicks} stopOpacity={0.28} />
              <stop offset="100%" stopColor={theme.brand.chart.clicks} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={theme.brand.border} strokeDasharray="3 4" />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(time: number) => formatTick(time, bucket)}
            tick={{ fill: theme.brand.steelMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: theme.brand.border }}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: theme.brand.steelMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ stroke: theme.brand.strongBorder, strokeWidth: 1 }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as ChartPoint | undefined;
              if (!active || !point) return null;
              return (
                <TooltipBox>
                  <TooltipTitle>{formatTooltipTitle(point.time, bucket)}</TooltipTitle>
                  <TooltipRow>
                    <Swatch $color={theme.brand.chart.clicks} />
                    {labels.clicks} <strong>{point.clicks.toLocaleString("pt-BR")}</strong>
                  </TooltipRow>
                  <TooltipRow>
                    <Swatch $color={theme.brand.chart.visitors} />
                    {labels.visitorsShort} <strong>{point.visitors.toLocaleString("pt-BR")}</strong>
                  </TooltipRow>
                </TooltipBox>
              );
            }}
          />
          {visibleMarkers.map((event) => (
            <ReferenceLine
              key={event.id}
              x={new Date(event.at).getTime()}
              stroke={theme.brand.chart.marker}
              strokeDasharray="4 4"
              ifOverflow="hidden"
            />
          ))}
          <Area
            type="monotone"
            dataKey="clicks"
            name={labels.clicks}
            stroke={theme.brand.chart.clicks}
            strokeWidth={2}
            fill="url(#clicksFill)"
            activeDot={{ r: 4, stroke: theme.brand.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            name={labels.visitors}
            stroke={theme.brand.chart.visitors}
            strokeWidth={2}
            fill="transparent"
            activeDot={{ r: 4, stroke: theme.brand.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Wrapper>
  );
};

export default ClicksChart;
