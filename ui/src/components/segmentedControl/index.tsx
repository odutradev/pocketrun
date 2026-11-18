import { Group, Segment } from "./styles";

import type { SegmentedControlProps } from "./types";

const SegmentedControl = <TValue extends string>({
  label,
  options,
  value,
  onValueChange,
  isFullWidth = false,
  isIconOnly = false,
  mobileColumns,
  size = "md"
}: SegmentedControlProps<TValue>): React.ReactElement => (
  <Group role="group" aria-label={label} $isFullWidth={isFullWidth} $mobileColumns={mobileColumns} $size={size}>
    {options.map((option) => (
      <Segment
        key={option.value}
        type="button"
        aria-pressed={option.value === value}
        aria-label={isIconOnly ? option.label : undefined}
        title={isIconOnly ? option.label : undefined}
        onClick={() => onValueChange(option.value)}
        $isActive={option.value === value}
        $isFullWidth={isFullWidth}
        $isIconOnly={isIconOnly}
        $size={size}
      >
        {option.icon}
        {!isIconOnly && option.label}
      </Segment>
    ))}
  </Group>
);

export default SegmentedControl;
