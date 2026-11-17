import { ArrowRightIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Arrow, Container, Dates, ErrorText, Point, PointLabel, PointValue, StartToggle, Timeline } from "./styles";
import { formatPeriodDate, hoursFromNow, roundedHourFromNow } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import { customPeriodHours } from "@assets/config";
import { periodPresetOptions } from "@assets/data";
import IconButton from "@components/iconButton";
import Button from "@components/button";
import Input from "@components/input";

import type { PeriodPreset } from "@utils/types/link";
import type { PeriodPickerProps } from "./types";

const PeriodPicker = ({ startsAt, endsAt, initialPreset, startsAtError, endsAtError, onChange }: PeriodPickerProps) => {
  const [preset, setPreset] = useState<PeriodPreset>(initialPreset);
  const [hasStart, setHasStart] = useState(Boolean(startsAt));

  const handlePreset = (value: PeriodPreset) => {
    setPreset(value);
    const hours = periodPresetOptions.find((option) => option.value === value)?.hours ?? null;
    setHasStart(false);
    onChange({ startsAt: "", endsAt: hours === null ? roundedHourFromNow(customPeriodHours) : hoursFromNow(hours) });
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
      {preset !== "custom" && endsAt && (
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
          {hasStart ? (
            <Input
              label="Começa em"
              type="datetime-local"
              value={startsAt}
              onChange={(event) => onChange({ startsAt: event.target.value, endsAt })}
              error={startsAtError}
              trailing={
                <IconButton
                  size="sm"
                  label="Remover o início"
                  icon={<Cross2Icon />}
                  onClick={() => {
                    setHasStart(false);
                    onChange({ startsAt: "", endsAt });
                  }}
                />
              }
            />
          ) : (
            <StartToggle>
              <Button
                variant="ghost"
                leftIcon={<PlusIcon />}
                onClick={() => {
                  setHasStart(true);
                  onChange({ startsAt: roundedHourFromNow(1), endsAt });
                }}
              >
                Definir início
              </Button>
            </StartToggle>
          )}
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
