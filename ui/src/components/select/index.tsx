import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useId } from "react";

import FormField from "@components/formField";
import { getFieldIds } from "@utils/functions";

import { Chevron, Control, Field } from "./styles";
import type { SelectProps } from "./types";

// Select nativo com a moldura dos campos: acessível no teclado e no leitor de tela sem esforço extra.
const Select: React.FC<SelectProps> = ({ label, options, value, onValueChange, hint, error, id, ...props }) => {
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
