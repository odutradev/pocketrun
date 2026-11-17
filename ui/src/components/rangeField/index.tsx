import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "styled-components";

import { cancelFrame, easeOutCubic, getFieldIds, prefersReducedMotion } from "@utils/functions";
import { Bound, Manual, ManualInput, Row, Slider, Track } from "./styles";
import FormField from "@components/formField";

import type { RangeFieldProps } from "./types";

const RangeField = ({ label, value, onValueChange, min = 0, max = 100, step = 1, unit, hint, error }: RangeFieldProps) => {
  const sliderId = useId();
  const { describedBy } = getFieldIds(sliderId, { hasHint: Boolean(hint), hasError: Boolean(error) });
  const { motion } = useTheme();
  const frameRef = useRef<number | null>(null);
  const [animatedFraction, setAnimatedFraction] = useState<number | null>(null);
  const [sliderMax, setSliderMax] = useState(() => (Number.isNaN(value) ? max : Math.max(max, value)));
  const sliderValue = Number.isNaN(value) ? min : Math.min(Math.max(value, min), sliderMax);
  const restingFraction = (sliderValue - min) / (sliderMax - min);
  const fraction = animatedFraction ?? restingFraction;

  useEffect(() => () => cancelFrame(frameRef), []);

  const animateTo = (target: number) => {
    cancelFrame(frameRef);
    if (prefersReducedMotion() || target === fraction) {
      setAnimatedFraction(null);
      return;
    }

    const origin = fraction;
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / motion.expressive, 1);
      if (progress >= 1) {
        frameRef.current = null;
        setAnimatedFraction(null);
        return;
      }
      setAnimatedFraction(origin + (target - origin) * easeOutCubic(progress));
      frameRef.current = window.requestAnimationFrame(step);
    };
    setAnimatedFraction(origin);
    frameRef.current = window.requestAnimationFrame(step);
  };

  const handleSliderChange = (next: number) => {
    cancelFrame(frameRef);
    setAnimatedFraction(null);
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
    const nextMax = Math.max(max, next);
    setSliderMax(nextMax);
    animateTo((Math.min(Math.max(next, min), nextMax) - min) / (nextMax - min));
    onValueChange(next);
  };

  return (
    <FormField controlId={sliderId} label={label} hint={hint} error={error}>
      <Row>
        <Track>
          <Bound aria-hidden="true">{min}</Bound>
          <Slider
            id={sliderId}
            type="range"
            min={min}
            max={sliderMax}
            step={step}
            value={animatedFraction === null ? sliderValue : Math.round(min + animatedFraction * (sliderMax - min))}
            aria-valuetext={unit ? `${value} ${unit}` : String(value)}
            aria-describedby={describedBy}
            onChange={(event) => handleSliderChange(Number(event.target.value))}
            $fill={fraction * 100}
          />
          <Bound aria-hidden="true">{sliderMax}</Bound>
        </Track>
        <Manual $hasError={Boolean(error)}>
          <ManualInput
            type="number"
            inputMode="numeric"
            placeholder="Valor exato"
            aria-label={`${label}, valor exato`}
            min={min}
            step={step}
            value={Number.isNaN(value) ? "" : value}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            onChange={(event) => handleManualChange(event.target.value)}
          />
        </Manual>
      </Row>
    </FormField>
  );
};

export default RangeField;
