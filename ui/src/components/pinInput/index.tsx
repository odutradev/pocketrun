import { useId, useState } from "react";

import { Box, Boxes, Caret, Field } from "./styles";
import { getFieldIds } from "@utils/functions";
import FormField from "@components/formField";

import type { ChangeEvent, FocusEvent, MouseEvent } from "react";
import type { PinInputProps } from "./types";

const moveCaretToEnd = (input: HTMLInputElement) => {
  const end = input.value.length;
  input.setSelectionRange(end, end);
};

const PinInput = ({ label, value, onChange, length = 6, hint, error, id, onFocus, onBlur, onClick, ...props }: PinInputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const { describedBy } = getFieldIds(inputId, { hasHint: Boolean(hint), hasError: Boolean(error) });
  const [isFocused, setIsFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value.replace(/\D/g, "").slice(0, length));

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    moveCaretToEnd(event.currentTarget);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    moveCaretToEnd(event.currentTarget);
    onClick?.(event);
  };

  return (
    <FormField controlId={inputId} label={label} hint={hint} error={error}>
      <Boxes $length={length}>
        {Array.from({ length }, (_, index) => {
          const isActive = isFocused && index === activeIndex;
          return (
            <Box key={index} aria-hidden="true" $isActive={isActive} $hasError={Boolean(error)}>
              {value[index] ?? (isActive && <Caret />)}
            </Box>
          );
        })}
        <Field
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          spellCheck={false}
          maxLength={length}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleClick}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...props}
        />
      </Boxes>
    </FormField>
  );
};

export default PinInput;
