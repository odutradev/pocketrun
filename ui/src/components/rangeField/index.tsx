import { useId } from "react";

import { Manual, ManualInput, ManualLabel, Row, Scale, Slider, Track } from "./styles";
import { getFieldIds } from "@utils/functions";
import FormField from "@components/formField";

import type { RangeFieldProps } from "./types";

const RangeField = ({ label, value, onValueChange, min = 0, max = 100, step = 1, unit, hint, error }: RangeFieldProps) => {
  const sliderId = useId();
  const { describedBy } = getFieldIds(sliderId, { hasHint: Boolean(hint), hasError: Boolean(error) });
  const sliderValue = Number.isNaN(value) ? min : Math.min(Math.max(value, min), max);
  const fill = ((sliderValue - min) / (max - min)) * 100;

  return (
    <FormField controlId={sliderId} label={label} hint={hint} error={error}>
      <Row>
        <Track>
          <Slider
            id={sliderId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            aria-valuetext={unit ? `${value} ${unit}` : String(value)}
            aria-describedby={describedBy}
            onChange={(event) => onValueChange(Number(event.target.value))}
            $fill={fill}
          />
          <Scale aria-hidden="true">
            <span>{min}</span>
            <span>{max}</span>
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
            onChange={(event) => onValueChange(event.target.value === "" ? Number.NaN : Number(event.target.value))}
            $hasError={Boolean(error)}
          />
        </Manual>
      </Row>
    </FormField>
  );
};

export default RangeField;
