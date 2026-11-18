import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "styled-components";

import { Center, CenterLabel, CenterValue, ChartArea, Legend, LegendItem, LegendValue, Swatch, Title, Wrapper } from "./styles";
import { deviceLabels } from "@assets/data";

import type { DevicesChartProps } from "./types";

const DevicesChart = ({ devices }: DevicesChartProps) => {
  const theme = useTheme();
  const total = devices.reduce((sum, device) => sum + device.clicks, 0);
  const colorOf = (name: string) => theme.brand.chart.devices[name] ?? theme.brand.chart.marker;
  const percentOf = (clicks: number) => (total === 0 ? 0 : Math.round((clicks / total) * 100));

  return (
    <Wrapper>
      <Title>Dispositivos</Title>
      <ChartArea>
        <ResponsiveContainer width="100%" height={168}>
          <PieChart>
            <Pie
              data={devices}
              dataKey="clicks"
              nameKey="name"
              innerRadius={56}
              outerRadius={78}
              paddingAngle={devices.length > 1 ? 2 : 0}
              stroke={theme.brand.surface}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {devices.map((device) => (
                <Cell key={device.name} fill={colorOf(device.name)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                const entry = payload?.[0];
                if (!active || !entry) return null;
                const name = String(entry.name);
                const clicks = Number(entry.value);
                return (
                  <LegendItem as="div" $isTooltip>
                    <Swatch $color={colorOf(name)} />
                    {deviceLabels[name] ?? name}
                    <LegendValue>
                      {clicks.toLocaleString("pt-BR")} · {percentOf(clicks)}%
                    </LegendValue>
                  </LegendItem>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <Center aria-hidden="true">
          <CenterValue>{total.toLocaleString("pt-BR")}</CenterValue>
          <CenterLabel>cliques</CenterLabel>
        </Center>
      </ChartArea>
      <Legend>
        {devices.map((device) => (
          <LegendItem key={device.name}>
            <Swatch $color={colorOf(device.name)} />
            {deviceLabels[device.name] ?? device.name}
            <LegendValue>{percentOf(device.clicks)}%</LegendValue>
          </LegendItem>
        ))}
      </Legend>
    </Wrapper>
  );
};

export default DevicesChart;
