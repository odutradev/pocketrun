import { Group, Segment } from "./styles";
import type { SegmentedControlProps } from "./types";

const SegmentedControl = <TValue extends string>({
  label,
  options,
  value,
  onValueChange,
  isFullWidth = false
}: SegmentedControlProps<TValue>): React.ReactElement => (
  <Group role="group" aria-label={label} $isFullWidth={isFullWidth}>
    {options.map((option) => (
      <Segment
        key={option.value}
        type="button"
        aria-pressed={option.value === value}
        onClick={() => onValueChange(option.value)}
        $isActive={option.value === value}
        $isFullWidth={isFullWidth}
      >
        {option.label}
      </Segment>
    ))}
  </Group>
);

export default SegmentedControl;
