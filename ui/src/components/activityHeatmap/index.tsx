import { Cell, Grid, HourLabel, Peak, RowLabel, Scale, ScaleStep, Wrapper } from "./styles";
import { clickUnit, weekdayShortLabels } from "@assets/data";
import { pluralize } from "@utils/functions";

import type { ActivityHeatmapProps } from "./types";

const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];

const hours = Array.from({ length: 24 }, (_, hour) => hour);

const levels = [0.12, 0.3, 0.5, 0.72, 1];

const ActivityHeatmap = ({ cells, unit = clickUnit }: ActivityHeatmapProps) => {
  const counts = new Map(cells.map((cell) => [`${cell.weekday}-${cell.hour}`, cell.clicks]));
  const max = Math.max(0, ...cells.map((cell) => cell.clicks));
  const peak = cells.reduce((best, cell) => (cell.clicks > best.clicks ? cell : best), { weekday: 0, hour: 0, clicks: 0 });
  const levelOf = (clicks: number) => (clicks === 0 || max === 0 ? 0 : levels[Math.min(levels.length - 1, Math.ceil((clicks / max) * levels.length) - 1)]);

  return (
    <Wrapper>
      {peak.clicks > 0 && (
        <Peak>
          Pico: <strong>{weekdayShortLabels[peak.weekday]}, {String(peak.hour).padStart(2, "0")}h</strong> com{" "}
          {pluralize(peak.clicks, unit.singular, unit.plural)}
        </Peak>
      )}
      <Grid role="img" aria-label={`${unit.plural[0].toUpperCase()}${unit.plural.slice(1)} por dia da semana e hora do dia`}>
        <span />
        {hours.map((hour) => (
          <HourLabel key={hour} aria-hidden="true">
            {hour % 6 === 0 ? `${hour}h` : ""}
          </HourLabel>
        ))}
        {weekdayOrder.flatMap((weekday) => [
          <RowLabel key={`label-${weekday}`} aria-hidden="true">
            {weekdayShortLabels[weekday]}
          </RowLabel>,
          ...hours.map((hour) => {
            const clicks = counts.get(`${weekday}-${hour}`) ?? 0;
            return (
              <Cell
                key={`${weekday}-${hour}`}
                $level={levelOf(clicks)}
                title={`${weekdayShortLabels[weekday]}, ${String(hour).padStart(2, "0")}h: ${pluralize(clicks, unit.singular, unit.plural)}`}
              />
            );
          })
        ])}
      </Grid>
      <Scale aria-hidden="true">
        Menos
        {levels.map((level) => (
          <ScaleStep key={level} $level={level} />
        ))}
        Mais
      </Scale>
    </Wrapper>
  );
};

export default ActivityHeatmap;
