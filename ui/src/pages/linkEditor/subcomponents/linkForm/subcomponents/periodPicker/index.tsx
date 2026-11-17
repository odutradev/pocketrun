import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Arrow, Container, Dates, ErrorText, Point, PointLabel, PointValue, Timeline } from "./styles";
import { formatPeriodDate, hoursFromNow } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import { periodPresetOptions } from "@assets/data";
import Input from "@components/input";

import type { PeriodPreset } from "@utils/types/link";
import type { PeriodPickerProps } from "./types";

const PeriodPicker = ({ startsAt, endsAt, initialPreset, startsAtError, endsAtError, onChange }: PeriodPickerProps) => {
  const [preset, setPreset] = useState<PeriodPreset>(initialPreset);

  const handlePreset = (value: PeriodPreset) => {
    setPreset(value);
    const hours = periodPresetOptions.find((option) => option.value === value)?.hours ?? null;
    if (hours === null) return;
    onChange({ startsAt: "", endsAt: hoursFromNow(hours) });
  };

  return (
    <Container>
      <SegmentedControl
        label="Duração do link"
        options={periodPresetOptions}
        value={preset}
        onValueChange={handlePreset}
        isFullWidth
      />
      {endsAt && (
        <Timeline>
          <Point>
            <PointLabel>Começa</PointLabel>
            <PointValue>{startsAt ? formatPeriodDate(startsAt) : "Agora"}</PointValue>
          </Point>
          <Arrow aria-hidden="true">
            <ArrowRightIcon />
          </Arrow>
          <Point>
            <PointLabel>Termina</PointLabel>
            <PointValue>{formatPeriodDate(endsAt)}</PointValue>
          </Point>
        </Timeline>
      )}
      {preset === "custom" && (
        <Dates>
          <Input
            label="Começa em *"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => onChange({ startsAt: event.target.value, endsAt })}
            error={startsAtError}
          />
          <Input
            label="Termina em"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => onChange({ startsAt, endsAt: event.target.value })}
            error={endsAtError}
          />
        </Dates>
      )}
      {preset !== "custom" && endsAtError && <ErrorText role="alert">{endsAtError}</ErrorText>}
    </Container>
  );
};

export default PeriodPicker;
