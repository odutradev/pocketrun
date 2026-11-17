export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface SegmentedControlProps<TValue extends string> {
  label: string;
  options: SegmentedOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  isFullWidth?: boolean;
}
