import { CalendarIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Container, Dates, Presets, Strong, Summary } from "./styles";
import { formatPeriodDate, hoursFromNow } from "@utils/functions";
import { periodPresetOptions } from "@assets/data";
import Button from "@components/button";
import Input from "@components/input";

import type { PeriodPreset, PeriodPresetOption } from "@utils/types/link";
import type { PeriodPickerProps } from "./types";

const PeriodPicker = ({ startsAt, endsAt, initialPreset, startsAtError, endsAtError, onChange }: PeriodPickerProps) => {
  const [preset, setPreset] = useState<PeriodPreset>(initialPreset);

  const handlePreset = (option: PeriodPresetOption) => {
    setPreset(option.value);
    if (option.hours === null) return;
    onChange({ startsAt: "", endsAt: hoursFromNow(option.hours) });
  };

  return (
    <Container>
      <Presets role="group" aria-label="Duração do link">
        {periodPresetOptions.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={preset === option.value ? "primary" : "secondary"}
            aria-pressed={preset === option.value}
            onClick={() => handlePreset(option)}
          >
            {option.label}
          </Button>
        ))}
      </Presets>
      {endsAt && (
        <Summary>
          <CalendarIcon aria-hidden="true" />
          Ativo de <Strong>{startsAt ? formatPeriodDate(startsAt) : "agora"}</Strong> até{" "}
          <Strong>{formatPeriodDate(endsAt)}</Strong>
        </Summary>
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
      {preset !== "custom" && endsAtError && <Summary role="alert">{endsAtError}</Summary>}
    </Container>
  );
};

export default PeriodPicker;
