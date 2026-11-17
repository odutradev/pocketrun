import { useId, useState } from "react";

import { Manual, ManualInput, ManualLabel, Row, Scale, Slider, Track } from "./styles";
import { getFieldIds } from "@utils/functions";
import FormField from "@components/formField";

import type { RangeFieldProps } from "./types";

const RangeField = ({ label, value, onValueChange, min = 0, max = 100, step = 1, unit, hint, error }: RangeFieldProps) => {
  const sliderId = useId();
  const { describedBy } = getFieldIds(sliderId, { hasHint: Boolean(hint), hasError: Boolean(error) });
  const [sliderMax, setSliderMax] = useState(() => (Number.isNaN(value) ? max : Math.max(max, value)));
  const sliderValue = Number.isNaN(value) ? min : Math.min(Math.max(value, min), sliderMax);
  const fill = ((sliderValue - min) / (sliderMax - min)) * 100;

  const handleSliderChange = (next: number) => {
    if (sliderMax > max && next < sliderValue) {
      setSliderMax(max);
      onValueChange(Math.min(next, max));
      return;
    }
    onValueChange(next);
  };

  const handleManualChange = (typed: string) => {
    if (typed === "") {
      onValueChange(Number.NaN);
      return;
    }
    const next = Number(typed);
    setSliderMax(Math.max(max, next));
    onValueChange(next);
  };

  return (
    <FormField controlId={sliderId} label={label} hint={hint} error={error}>
      <Row>
        <Track>
          <Slider
            id={sliderId}
            type="range"
            min={min}
            max={sliderMax}
            step={step}
            value={sliderValue}
            aria-valuetext={unit ? `${value} ${unit}` : String(value)}
            aria-describedby={describedBy}
            onChange={(event) => handleSliderChange(Number(event.target.value))}
            $fill={fill}
          />
          <Scale aria-hidden="true">
            <span>{min}</span>
            <span>{sliderMax}</span>
          </Scale>
        </Track>
        <Manual>
          <ManualLabel>Valor exato</ManualLabel>
          <ManualInput
            type="number"
            inputMode="numeric"
            min={min}
            step={step}
            value={Number.isNaN(value) ? "" : value}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            onChange={(event) => handleManualChange(event.target.value)}
            $hasError={Boolean(error)}
          />
        </Manual>
      </Row>
    </FormField>
  );
};

export default RangeField;
