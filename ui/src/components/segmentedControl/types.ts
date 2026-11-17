export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface SegmentedControlProps<TValue extends string> {
  // Nome do grupo para leitores de tela.
  label: string;
  options: SegmentedOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  isFullWidth?: boolean;
}
