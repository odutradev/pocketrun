import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useId } from "react";

import { Chevron, Control, Field } from "./styles";
import { getFieldIds } from "@utils/functions";
import FormField from "@components/formField";

import type { SelectProps } from "./types";

const Select = ({ label, options, value, onValueChange, hint, error, id, ...props }: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const { describedBy } = getFieldIds(selectId, { hasHint: Boolean(hint), hasError: Boolean(error) });

  return (
    <FormField controlId={selectId} label={label} hint={hint} error={error}>
      <Control $hasError={Boolean(error)}>
        <Field
          id={selectId}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field>
        <Chevron aria-hidden="true">
          <ChevronDownIcon />
        </Chevron>
      </Control>
    </FormField>
  );
};

export default Select;
