import { Choice, Group, Legend, Option, Options, Radio, Selected } from "./styles";

import type { OptionGridProps } from "./types";

const OptionGrid = <TValue extends string>({
  label,
  name,
  options,
  value,
  onValueChange
}: OptionGridProps<TValue>): React.ReactElement => {
  const selected = options.find((option) => option.value === value);

  return (
    <Group>
      <Legend>
        {label}
        {selected && <Selected aria-hidden="true">{selected.label}</Selected>}
      </Legend>
      <Options>
        {options.map((option) => (
          <Option key={option.value} title={option.label}>
            <Radio
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              aria-label={option.label}
              onChange={() => onValueChange(option.value)}
            />
            <Choice aria-hidden="true">{option.content}</Choice>
          </Option>
        ))}
      </Options>
    </Group>
  );
};

export default OptionGrid;
