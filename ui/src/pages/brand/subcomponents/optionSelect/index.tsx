import { Select } from "@radix-ui/themes";

import { Field, FieldLabel } from "./styles";
import type { OptionSelectProps } from "./types";

const OptionSelect = <T extends string | number>({ label, value, options, onChange }: OptionSelectProps<T>) => {
  const handleChange = (raw: string) => {
    const option = options.find((item) => String(item.value) === raw);
    if (option) onChange(option.value);
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select.Root value={String(value)} onValueChange={handleChange}>
        <Select.Trigger aria-label={label} />
        <Select.Content position="popper">
          {options.map((option) => (
            <Select.Item key={String(option.value)} value={String(option.value)}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Field>
  );
};

export default OptionSelect;
